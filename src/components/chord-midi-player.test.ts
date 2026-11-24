import { readFileSync } from "node:fs";
import { createElement, type EffectCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChordMidiPlayer, type ChordMidiPlayerHandle, type ChordProgressionMidiId } from "./chord-midi-player";
import type { NoteEventValue } from "../lib/chord-midi-playback";

// Server rendering supplies real React refs/callbacks. Capture the imperative
// handle and effects so these tests can drive pending loads and unmount cleanup
// without a browser or a real audio device.
const lifecycle = vi.hoisted(() => ({
  effects: [] as EffectCallback[],
  handle: null as ChordMidiPlayerHandle | null,
}));
const audio = vi.hoisted(() => ({
  fromUrl: vi.fn(),
  unlock: vi.fn(),
  start: vi.fn(),
  synth: vi.fn(),
  dispose: vi.fn(),
  triggerAttackRelease: vi.fn(),
  releaseAll: vi.fn(),
  cancelDraw: vi.fn(),
  scheduleDraw: vi.fn(),
  partStart: vi.fn(),
  partDispose: vi.fn(),
  partEvents: [] as [number, NoteEventValue][][],
  partCallbacks: [] as ((time: number, note: NoteEventValue) => void)[],
}));

vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: (effect: EffectCallback) => { lifecycle.effects.push(effect); },
  useImperativeHandle: (_ref: unknown, create: () => ChordMidiPlayerHandle) => {
    lifecycle.handle = create();
  },
}));
vi.mock("@/app/page.module.css", () => ({ default: {} }));
vi.mock("@/lib/chord-midi-playback", () => import("../lib/chord-midi-playback"));
vi.mock("@tonejs/midi", () => ({ Midi: { fromUrl: audio.fromUrl } }));
vi.mock("tone", () => ({
  start: audio.unlock,
  getDraw: () => ({ cancel: audio.cancelDraw, schedule: audio.scheduleDraw }),
  Transport: {
    stop: vi.fn(), cancel: vi.fn(), start: audio.start,
    bpm: { value: 138 }, seconds: 0, loop: false, loopStart: 0, loopEnd: 0,
  },
  PolySynth: class {
    volume = { value: 0 };
    constructor() { audio.synth(); }
    toDestination() { return this; }
    dispose() { audio.dispose(); }
    triggerAttackRelease = audio.triggerAttackRelease;
    releaseAll = audio.releaseAll;
  },
  Synth: class {},
  Part: class {
    constructor(callback: (time: number, note: NoteEventValue) => void, events: [number, NoteEventValue][]) {
      audio.partCallbacks.push(callback);
      audio.partEvents.push(events);
    }
    start(time: number) { audio.partStart(time); }
    dispose() { audio.partDispose(); }
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const midi = {
  header: { tempos: [{ bpm: 138 }] },
  duration: 2,
  tracks: [{ notes: [0, 1].map((time) => ({ name: "D3", time, duration: 1, velocity: 0.8 })) }],
};

function mountPlayer(progressionId: ChordProgressionMidiId = "verse") {
  const onActiveChordIndex = vi.fn();
  renderToStaticMarkup(createElement(ChordMidiPlayer, { progressionId, onActiveChordIndex }));
  const cleanups = lifecycle.effects.map((effect) => effect());
  return {
    handle: lifecycle.handle!,
    onActiveChordIndex,
    unmount: () => cleanups.forEach((cleanup) => { if (cleanup) cleanup(); }),
  };
}

// Drain the already-started async load, including its catch/finally callbacks.
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

describe("MIDI pending-load lifecycle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    audio.cancelDraw.mockReset();
    audio.scheduleDraw.mockReset();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycle.effects = [];
    lifecycle.handle = null;
    audio.partCallbacks = [];
    audio.partEvents = [];
    audio.unlock.mockResolvedValue(undefined);
  });

  it.each([
    { id: "verse", chordCount: 7 },
    { id: "chorus", chordCount: 7 },
    { id: "bridge", chordCount: 6 },
  ] as const)("positions $id chord jumps on the downloadable MIDI timeline", async ({ id, chordCount }) => {
    // Parse the shipped asset rather than supplying an invented note timeline.
    const { Midi } = await vi.importActual<typeof import("@tonejs/midi")>("@tonejs/midi");
    const asset = new Midi(readFileSync(new URL(`../../public/midi/${id}.mid`, import.meta.url)));
    const { Transport } = await import("tone");
    const secondsPerChord = 2 * 60 / asset.header.tempos[0].bpm;
    audio.fromUrl.mockResolvedValueOnce(asset);
    const player = mountPlayer(id);

    // The first request loads at a nonzero step; later requests reuse the session.
    const requestedSteps = [2, 3, 0, 999, -1];
    const expectedSteps = [2, 3, 0, chordCount - 1, 0];
    for (const [requestIndex, requestedStep] of requestedSteps.entries()) {
      player.handle.playFromChordIndex(requestedStep);
      await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(requestIndex + 1));
      const expectedOffset = expectedSteps[requestIndex] * secondsPerChord;
      expect(Transport.seconds).toBeCloseTo(expectedOffset, 4);
      expect(Transport.loopStart).toBeCloseTo(expectedOffset, 4);
      expect(Transport.loopEnd).toBeCloseTo(asset.duration, 4);
      expect(Transport.loop).toBe(true);
      expect(Transport.bpm.value).toBe(asset.header.tempos[0].bpm);
      expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(expectedSteps[requestIndex]);

      // Parts retain the absolute MIDI timeline. Starting them at the jump offset
      // would apply it twice, while filtering would lose earlier chords on a rewind.
      expect(audio.partStart).toHaveBeenLastCalledWith(0);
      const events = audio.partEvents[requestIndex];
      expect(events).toHaveLength(asset.tracks.flatMap((track) => track.notes).length);
      const firstChord = events.filter(([, note]) => note.chordIndex === 0);
      const lastChord = events.filter(([, note]) => note.chordIndex === chordCount - 1);
      expect(firstChord).toHaveLength(3);
      expect(firstChord.every(([time]) => time === 0)).toBe(true);
      expect(lastChord).toHaveLength(3);
      for (const [time] of lastChord) {
        expect(time).toBeCloseTo((chordCount - 1) * secondsPerChord, 4);
      }
    }

    expect(audio.fromUrl).toHaveBeenCalledExactlyOnceWith(`/midi/${id}.mid`);
    expect(audio.synth).toHaveBeenCalledOnce();
    player.unmount();
  });

  it("plays every voice of a chord but highlights it only once at the audio draw time", async () => {
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    player.onActiveChordIndex.mockClear();
    const playNote = audio.partCallbacks[0];

    // Tone supplies absolute audio-context times, not the MIDI's relative seconds.
    playNote(12.5, { name: "D3", duration: 0.8, velocity: 0.7, chordIndex: 0 });
    playNote(12.5, { name: "F#3", duration: 0.9, velocity: 0.6, chordIndex: 0 });
    playNote(12.5, { name: "A3", duration: 1, velocity: 0.5, chordIndex: 0 });

    expect(audio.triggerAttackRelease.mock.calls).toEqual([
      ["D3", 0.8, 12.5, 0.7],
      ["F#3", 0.9, 12.5, 0.6],
      ["A3", 1, 12.5, 0.5],
    ]);
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
    expect(audio.scheduleDraw).toHaveBeenCalledExactlyOnceWith(expect.any(Function), 12.5);
    const drawChord = audio.scheduleDraw.mock.calls[0][0] as () => void;
    drawChord();
    expect(player.onActiveChordIndex).toHaveBeenCalledExactlyOnceWith(0);
    player.unmount();
  });

  it("highlights the first chord again on each loop and after a cached jump", async () => {
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    player.onActiveChordIndex.mockClear();
    const playNote = audio.partCallbacks[0];
    const note = { name: "D3", duration: 1, velocity: 0.8 };
    playNote(20, { ...note, chordIndex: 0 });
    playNote(21, { ...note, chordIndex: 1 });
    playNote(22, { ...note, chordIndex: 0 });
    expect(audio.scheduleDraw.mock.calls.map(([, time]) => time)).toEqual([20, 21, 22]);
    for (const [draw] of audio.scheduleDraw.mock.calls) (draw as () => void)();
    expect(player.onActiveChordIndex.mock.calls).toEqual([[0], [1], [0]]);

    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
    player.onActiveChordIndex.mockClear();
    audio.scheduleDraw.mockClear();
    audio.partCallbacks[1](30, { ...note, chordIndex: 0 });
    expect(audio.scheduleDraw).toHaveBeenCalledExactlyOnceWith(expect.any(Function), 30);
    (audio.scheduleDraw.mock.calls[0][0] as () => void)();
    expect(player.onActiveChordIndex).toHaveBeenCalledExactlyOnceWith(0);
    expect(audio.fromUrl).toHaveBeenCalledOnce();
    player.unmount();
  });

  it.each(["cached jump", "unmount"] as const)(
    "cancels queued chord highlights on %s without delivering stale updates",
    async (action) => {
      // Model Draw's pending frame callbacks separately from note playback:
      // audio may be scheduled ahead of the frame that displays its chord.
      const pendingFrames: (() => void)[] = [];
      audio.scheduleDraw.mockImplementation((callback: () => void) => pendingFrames.push(callback));
      audio.cancelDraw.mockImplementation(() => { pendingFrames.length = 0; });
      const flushFrames = () => pendingFrames.splice(0).forEach((callback) => callback());
      audio.fromUrl.mockResolvedValueOnce(midi);
      const player = mountPlayer();
      player.handle.playFromChordIndex(0);
      await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());

      audio.partCallbacks[0](42, audio.partEvents[0][0][1]);
      expect(pendingFrames).toHaveLength(1);
      player.onActiveChordIndex.mockClear();
      audio.cancelDraw.mockClear();

      if (action === "cached jump") {
        player.handle.playFromChordIndex(1);
        await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
      } else {
        player.unmount();
      }

      expect(player.onActiveChordIndex).toHaveBeenCalledExactlyOnceWith(action === "cached jump" ? 1 : null);
      player.onActiveChordIndex.mockClear();
      flushFrames();
      expect(player.onActiveChordIndex).not.toHaveBeenCalled();
      expect(audio.cancelDraw).toHaveBeenCalledExactlyOnceWith(0);

      if (action === "cached jump") {
        // Cancellation must not prevent the new Part's future highlights.
        audio.partCallbacks[1](43, audio.partEvents[1][1][1]);
        expect(pendingFrames).toHaveLength(1);
        expect(player.onActiveChordIndex).not.toHaveBeenCalled();
        flushFrames();
        expect(player.onActiveChordIndex).toHaveBeenCalledExactlyOnceWith(1);
        expect(audio.fromUrl).toHaveBeenCalledOnce();
        expect(audio.synth).toHaveBeenCalledOnce();
        player.unmount();
      }
    },
  );

  it("releases held voices before restarting a cached chord jump", async () => {
    const { Transport } = await import("tone");
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(audio.releaseAll).not.toHaveBeenCalled();

    // Already-triggered voices belong to the synth, not the MIDI Part. Replacing
    // the schedule alone leaves them held while the newly selected chord plays.
    audio.partCallbacks[0](12.5, { name: "D3", duration: 1, velocity: 0.8, chordIndex: 0 });
    expect(audio.triggerAttackRelease).toHaveBeenCalledOnce();
    vi.mocked(Transport.stop).mockClear();
    audio.start.mockClear();

    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(audio.releaseAll).toHaveBeenCalledExactlyOnceWith();
    expect(Transport.stop).toHaveBeenCalledBefore(audio.releaseAll);
    expect(audio.releaseAll).toHaveBeenCalledBefore(audio.partDispose);
    expect(audio.releaseAll).toHaveBeenCalledBefore(audio.start);
    expect(Transport.seconds).toBe(1);
    expect(Transport.loopStart).toBe(1);
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    expect(audio.fromUrl).toHaveBeenCalledOnce();
    expect(audio.synth).toHaveBeenCalledOnce();
    expect(audio.dispose).not.toHaveBeenCalled();
    player.unmount();
  });

  it("does not start audio or restore a chord highlight after unmount during a MIDI fetch", async () => {
    const pending = deferred<typeof midi>();
    audio.fromUrl.mockReturnValueOnce(pending.promise);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.fromUrl).toHaveBeenCalledOnce());
    player.unmount();
    player.onActiveChordIndex.mockClear();
    pending.resolve(midi);
    await settle();
    expect(audio.synth).not.toHaveBeenCalled();
    expect(audio.start).not.toHaveBeenCalled();
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
  });

  it("keeps the newest chord request when an older MIDI fetch finishes last", async () => {
    const older = deferred<typeof midi>();
    const newer = deferred<typeof midi>();
    audio.fromUrl.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.fromUrl).toHaveBeenCalledTimes(1));
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.fromUrl).toHaveBeenCalledTimes(2));
    newer.resolve(midi);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.onActiveChordIndex.mockClear();
    older.resolve(midi);
    await settle();
    expect(audio.synth).toHaveBeenCalledOnce();
    expect(audio.start).toHaveBeenCalledOnce();
    expect(audio.dispose).not.toHaveBeenCalled();
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
    player.unmount();
  });

  it("ignores an obsolete fetch failure without stopping the current playback", async () => {
    const older = deferred<typeof midi>();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    audio.fromUrl.mockReturnValueOnce(older.promise).mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.fromUrl).toHaveBeenCalledTimes(1));
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    player.onActiveChordIndex.mockClear();
    older.reject(new Error("Obsolete request failed"));
    await settle();
    expect(log).not.toHaveBeenCalled();
    expect(audio.dispose).not.toHaveBeenCalled();
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
    player.unmount();
  });

  it("does not fetch MIDI if unmounted while audio permission is pending", async () => {
    const permission = deferred<void>();
    audio.unlock.mockReturnValueOnce(permission.promise);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.unlock).toHaveBeenCalledOnce());
    player.unmount();
    permission.resolve();
    await settle();
    expect(audio.fromUrl).not.toHaveBeenCalled();
    expect(audio.synth).not.toHaveBeenCalled();
    expect(audio.start).not.toHaveBeenCalled();
  });

  it.each(["approval", "rejection"] as const)(
    "ignores late initial audio-permission %s after a newer chord starts",
    async (outcome) => {
      const permission = deferred<void>();
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { Transport } = await import("tone");
      audio.unlock.mockReturnValueOnce(permission.promise);
      audio.fromUrl.mockResolvedValueOnce(midi);
      const player = mountPlayer();

      // The first request has not fetched MIDI or allocated a session yet.
      player.handle.playFromChordIndex(0);
      await vi.waitFor(() => expect(audio.unlock).toHaveBeenCalledOnce());
      expect(audio.fromUrl).not.toHaveBeenCalled();
      expect(audio.synth).not.toHaveBeenCalled();

      player.handle.playFromChordIndex(1);
      await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
      expect(audio.unlock).toHaveBeenCalledTimes(2);
      expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
      player.onActiveChordIndex.mockClear();
      vi.mocked(Transport.stop).mockClear();
      vi.mocked(Transport.cancel).mockClear();

      if (outcome === "approval") permission.resolve();
      else permission.reject(new Error("Obsolete initial audio permission denied"));
      await settle();

      expect(log).not.toHaveBeenCalled();
      expect(audio.fromUrl).toHaveBeenCalledExactlyOnceWith("/midi/verse.mid");
      expect(audio.synth).toHaveBeenCalledOnce();
      expect(audio.start).toHaveBeenCalledOnce();
      expect(audio.dispose).not.toHaveBeenCalled();
      expect(audio.partDispose).not.toHaveBeenCalled();
      expect(Transport.stop).not.toHaveBeenCalled();
      expect(Transport.cancel).not.toHaveBeenCalled();
      expect(Transport.seconds).toBe(1);
      expect(Transport.loop).toBe(true);
      expect(player.onActiveChordIndex).not.toHaveBeenCalled();

      player.unmount();
      expect(audio.dispose).toHaveBeenCalledOnce();
      expect(audio.partDispose).toHaveBeenCalledOnce();
    },
  );

  it("does not restart a cached session after unmount during audio permission", async () => {
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    const permission = deferred<void>();
    audio.unlock.mockReturnValueOnce(permission.promise);
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.unlock).toHaveBeenCalledTimes(2));
    player.unmount();
    player.onActiveChordIndex.mockClear();
    permission.resolve();
    await settle();
    expect(audio.start).toHaveBeenCalledOnce();
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
  });

  it("allows a fresh retry after the initial audio permission is denied", async () => {
    const error = new Error("Audio permission denied");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    audio.unlock.mockRejectedValueOnce(error);
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();

    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(log).toHaveBeenCalledExactlyOnceWith(error));
    expect(audio.fromUrl).not.toHaveBeenCalled();
    expect(audio.synth).not.toHaveBeenCalled();
    expect(audio.start).not.toHaveBeenCalled();
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(null);

    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(audio.unlock).toHaveBeenCalledTimes(2);
    expect(audio.fromUrl).toHaveBeenCalledExactlyOnceWith("/midi/verse.mid");
    expect(audio.synth).toHaveBeenCalledOnce();
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.unmount();
  });

  it("disposes a partially started session and reloads successfully after transport startup fails", async () => {
    const error = new Error("Audio transport failed to start");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { Transport } = await import("tone");
    audio.fromUrl.mockResolvedValueOnce(midi).mockResolvedValueOnce(midi);
    audio.start.mockImplementationOnce(() => { throw error; });
    const player = mountPlayer();

    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(log).toHaveBeenCalledExactlyOnceWith(error));
    expect(audio.synth).toHaveBeenCalledOnce();
    expect(audio.dispose).toHaveBeenCalledOnce();
    expect(audio.partDispose).toHaveBeenCalledOnce();
    expect(Transport.stop).toHaveBeenCalled();
    expect(Transport.cancel).toHaveBeenCalledWith(0);
    expect(Transport.loop).toBe(false);
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(null);

    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
    expect(audio.fromUrl).toHaveBeenCalledTimes(2);
    expect(audio.synth).toHaveBeenCalledTimes(2);
    expect(audio.dispose).toHaveBeenCalledOnce();
    expect(audio.partDispose).toHaveBeenCalledOnce();
    expect(Transport.seconds).toBe(1);
    expect(Transport.loop).toBe(true);
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.unmount();
    expect(audio.dispose).toHaveBeenCalledTimes(2);
    expect(audio.partDispose).toHaveBeenCalledTimes(2);
  });

  it("still reports a current fetch failure and allows a successful retry", async () => {
    const error = new Error("MIDI unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    audio.fromUrl.mockRejectedValueOnce(error).mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(log).toHaveBeenCalledWith(error));
    expect(audio.synth).not.toHaveBeenCalled();
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.unmount();
  });

  it.each([
    { description: "no tracks", tracks: [] },
    { description: "tracks without notes", tracks: [{ notes: [] }, { notes: [] }] },
  ])("rejects MIDI with $description and allows a fresh retry", async ({ tracks }) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    audio.fromUrl.mockResolvedValueOnce({ ...midi, duration: 0, tracks }).mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await settle();
    expect(log).toHaveBeenCalledExactlyOnceWith(new Error("MIDI contains no playable notes."));
    expect(audio.synth).not.toHaveBeenCalled();
    expect(audio.start).not.toHaveBeenCalled();
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(null);

    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    expect(audio.fromUrl).toHaveBeenCalledTimes(2);
    expect(audio.synth).toHaveBeenCalledOnce();
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.unmount();
  });

  it("keeps the latest cached chord jump when audio permissions resolve out of order", async () => {
    audio.fromUrl.mockResolvedValueOnce(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    const older = deferred<void>();
    const newer = deferred<void>();
    audio.unlock.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    player.handle.playFromChordIndex(0);
    player.handle.playFromChordIndex(1);
    newer.resolve();
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.onActiveChordIndex.mockClear();
    older.resolve();
    await settle();
    expect(audio.start).toHaveBeenCalledTimes(2);
    expect(player.onActiveChordIndex).not.toHaveBeenCalled();
    expect(audio.fromUrl).toHaveBeenCalledOnce();
    expect(audio.synth).toHaveBeenCalledOnce();
    player.unmount();
  });

  it("handles a cached audio-permission rejection and allows a fresh retry", async () => {
    const error = new Error("Audio permission denied");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    audio.fromUrl.mockResolvedValue(midi);
    const player = mountPlayer();
    player.handle.playFromChordIndex(0);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
    audio.unlock.mockRejectedValueOnce(error);
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(log).toHaveBeenCalledWith(error));
    expect(audio.dispose).toHaveBeenCalledOnce();
    expect(audio.start).toHaveBeenCalledOnce();
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(null);
    player.handle.playFromChordIndex(1);
    await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
    expect(audio.fromUrl).toHaveBeenCalledTimes(2);
    expect(player.onActiveChordIndex).toHaveBeenLastCalledWith(1);
    player.unmount();
  });

  it.each(["newer jump", "unmount"] as const)(
    "ignores a cached permission rejection after %s",
    async (supersededBy) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      audio.fromUrl.mockResolvedValueOnce(midi);
      const player = mountPlayer();
      player.handle.playFromChordIndex(0);
      await vi.waitFor(() => expect(audio.start).toHaveBeenCalledOnce());
      const permission = deferred<void>();
      audio.unlock.mockReturnValueOnce(permission.promise);
      player.handle.playFromChordIndex(0);
      if (supersededBy === "newer jump") {
        player.handle.playFromChordIndex(1);
        await vi.waitFor(() => expect(audio.start).toHaveBeenCalledTimes(2));
      } else {
        player.unmount();
      }
      player.onActiveChordIndex.mockClear();
      audio.dispose.mockClear();
      permission.reject(new Error("Obsolete audio permission failed"));
      await settle();
      expect(log).not.toHaveBeenCalled();
      expect(audio.dispose).not.toHaveBeenCalled();
      expect(player.onActiveChordIndex).not.toHaveBeenCalled();
      expect(audio.start).toHaveBeenCalledTimes(supersededBy === "newer jump" ? 2 : 1);
      if (supersededBy === "newer jump") player.unmount();
    },
  );
});
