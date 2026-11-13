import { createElement, type EffectCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChordMidiPlayer, type ChordMidiPlayerHandle } from "./chord-midi-player";

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
  getDraw: () => ({ cancel: vi.fn(), schedule: vi.fn() }),
  Transport: {
    stop: vi.fn(), cancel: vi.fn(), start: audio.start,
    bpm: { value: 138 }, seconds: 0, loop: false, loopStart: 0, loopEnd: 0,
  },
  PolySynth: class {
    volume = { value: 0 };
    constructor() { audio.synth(); }
    toDestination() { return this; }
    dispose() { audio.dispose(); }
  },
  Synth: class {},
  Part: class {
    start() {}
    dispose() {}
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

function mountPlayer() {
  const onActiveChordIndex = vi.fn();
  renderToStaticMarkup(createElement(ChordMidiPlayer, { progressionId: "verse", onActiveChordIndex }));
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
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycle.effects = [];
    lifecycle.handle = null;
    audio.unlock.mockResolvedValue(undefined);
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
