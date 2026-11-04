import { readFileSync } from "node:fs";
import { Midi } from "@tonejs/midi";
import { describe, expect, it } from "vitest";

// Pitch classes allow octave/voicing changes while preserving each displayed chord.
const chordPitchClasses: Record<string, readonly number[]> = {
  D: [2, 6, 9],
  A: [1, 4, 9],
  E: [4, 8, 11],
  G: [2, 7, 11],
  Bm: [2, 6, 11],
  "F#m": [1, 6, 9],
};

describe("downloadable MIDI practice harmony", () => {
  it.each([
    { id: "verse", chords: ["D", "A", "E", "G", "D", "A", "E"] },
    { id: "chorus", chords: ["D", "A", "E", "G", "D", "A", "E"] },
    { id: "bridge", chords: ["Bm", "F#m", "G", "D", "A", "E"] },
  ])("plays every $id chord in order, including repeated steps", ({ id, chords }) => {
    const midi = new Midi(readFileSync(new URL(`../../public/midi/${id}.mid`, import.meta.url)));
    const notes = midi.tracks.flatMap((track) => track.notes);
    const starts = [...new Set(notes.map((note) => note.ticks))].sort((a, b) => a - b);

    expect(starts).toHaveLength(chords.length);
    starts.forEach((start, index) => {
      const pitches = notes
        .filter((note) => note.ticks === start)
        .map((note) => note.midi % 12)
        .sort((a, b) => a - b);

      expect(pitches, `${id} step ${index + 1}: ${chords[index]}`).toEqual(
        chordPitchClasses[chords[index]],
      );
    });
  });
});
