type MidiNote = {
  name: string;
  time: number;
  duration: number;
  velocity: number;
};

export type NoteEventValue = Omit<MidiNote, "time"> & { chordIndex: number };

export function buildMidiPlaybackEvents(tracks: readonly { notes: readonly MidiNote[] }[]) {
  const notes = tracks.flatMap((track) => track.notes);
  const starts = [...new Set(notes.map((note) => note.time))].sort((a, b) => a - b);
  const chordIndices = new Map(starts.map((time, index) => [time, index]));
  // MIDI note times and numeric Tone.Part times are both seconds.
  const events: [number, NoteEventValue][] = notes.map((note) => [
    note.time,
    {
      name: note.name,
      duration: note.duration,
      velocity: note.velocity,
      chordIndex: chordIndices.get(note.time)!,
    },
  ]);
  events.sort((a, b) => a[0] - b[0]);
  return { events, starts };
}

type PlaybackTransport = {
  loop: boolean;
  loopStart: Unit.Time;
  loopEnd: Unit.Time;
  seconds: number;
};

/** Reconfigure at the current playhead; callers cancel the previous end timer first. */
export function configureMidiPlaybackLoop(
  transport: PlaybackTransport,
  loop: boolean,
  offsetSec: number,
  durationSec: number,
  onEnd: () => void,
): () => void {
  transport.loop = loop;
  transport.loopStart = offsetSec;
  transport.loopEnd = durationSec;
  if (loop) return () => {};

  const remainingSec = Math.max(0, durationSec - transport.seconds);
  // Retain the player's short release tail before disposing the synth.
  const timer = setTimeout(onEnd, Math.ceil(remainingSec * 1000) + 200);
  return () => clearTimeout(timer);
}
import type { Unit } from "tone";
