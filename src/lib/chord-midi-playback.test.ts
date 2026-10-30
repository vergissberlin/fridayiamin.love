import { readFileSync } from "node:fs";
import { Midi } from "@tonejs/midi";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMidiPlaybackEvents, configureMidiPlaybackLoop } from "./chord-midi-playback";

describe("MIDI practice timing", () => {
  it.each(["verse", "chorus", "bridge"])("keeps %s notes and chord jumps on the same seconds timeline", (id) => {
    const midi = new Midi(readFileSync(new URL(`../../public/midi/${id}.mid`, import.meta.url)));
    const { events, starts } = buildMidiPlaybackEvents(midi.tracks);
    const chordLengthSec = 2 * 60 / midi.header.tempos[0].bpm;

    expect(starts[1]).toBeCloseTo(chordLengthSec, 4);
    expect(events).toHaveLength(midi.tracks.flatMap((track) => track.notes).length);
    for (const [time, note] of events) {
      expect(time).toBe(starts[note.chordIndex]);
      expect(time + note.duration).toBeLessThanOrEqual(midi.duration + 0.000001);
    }
    const finalChord = events.filter(([, note]) => note.chordIndex === starts.length - 1);
    expect(finalChord.length).toBeGreaterThan(0);
    expect(finalChord[0][0] + finalChord[0][1].duration).toBeCloseTo(midi.duration);
  });

  it("groups simultaneous notes across tracks and orders chord highlights by time", () => {
    const note = { name: "D3", duration: 0.5, velocity: 0.8 };
    const { events, starts } = buildMidiPlaybackEvents([
      { notes: [{ ...note, time: 2 }, { ...note, time: 0 }] },
      { notes: [{ ...note, name: "A3", time: 0 }] },
    ]);
    expect(starts).toEqual([0, 2]);
    expect(events.map(([time, value]) => [time, value.chordIndex])).toEqual([[0, 0], [0, 0], [2, 1]]);
  });
});

describe("MIDI loop changes", () => {
  afterEach(() => vi.useRealTimers());

  it("loops from a selected chord in seconds without scheduling a stop", () => {
    vi.useFakeTimers();
    const transport = { seconds: 2, loop: false, loopStart: 0, loopEnd: 0 };
    const onEnd = vi.fn();
    const cancel = configureMidiPlaybackLoop(transport, true, 2, 6, onEnd);
    expect(transport).toMatchObject({ loop: true, loopStart: 2, loopEnd: 6 });
    vi.advanceTimersByTime(20_000);
    expect(onEnd).not.toHaveBeenCalled();
    cancel();
  });

  it("finishes the current pass when looping is disabled after playback advances", () => {
    vi.useFakeTimers();
    const transport = { seconds: 4.5, loop: true, loopStart: 2, loopEnd: 6 };
    const onEnd = vi.fn();
    configureMidiPlaybackLoop(transport, false, 2, 6, onEnd);
    expect(transport.loop).toBe(false);
    vi.advanceTimersByTime(1699);
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it("cancels the pending stop when looping is enabled again", () => {
    vi.useFakeTimers();
    const transport = { seconds: 2, loop: false, loopStart: 0, loopEnd: 6 };
    const onEnd = vi.fn();
    const cancel = configureMidiPlaybackLoop(transport, false, 0, 6, onEnd);
    vi.advanceTimersByTime(1000);
    transport.seconds = 3;
    cancel();
    configureMidiPlaybackLoop(transport, true, 0, 6, onEnd);
    vi.advanceTimersByTime(20_000);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("cleans up the old stop timer when jumping to another chord or stopping", () => {
    vi.useFakeTimers();
    const transport = { seconds: 0, loop: false, loopStart: 0, loopEnd: 6 };
    const onEnd = vi.fn();
    const cancel = configureMidiPlaybackLoop(transport, false, 0, 6, onEnd);
    cancel();
    transport.seconds = 5;
    const cancelJump = configureMidiPlaybackLoop(transport, false, 5, 6, onEnd);
    expect(vi.getTimerCount()).toBe(1);
    cancelJump();
    vi.advanceTimersByTime(10_000);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("returns to idle after the release tail when loop is disabled at the end", () => {
    vi.useFakeTimers();
    const transport = { seconds: 6.1, loop: true, loopStart: 0, loopEnd: 6 };
    const onEnd = vi.fn();
    configureMidiPlaybackLoop(transport, false, 0, 6, onEnd);
    vi.advanceTimersByTime(200);
    expect(onEnd).toHaveBeenCalledOnce();
  });
});
