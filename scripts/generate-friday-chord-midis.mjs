/**
 * Generates practice MIDI files for chord progressions (fan reference, not the original recording).
 * Run: node scripts/generate-friday-chord-midis.mjs
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const MidiWriter = require("midi-writer-js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "midi");

/** Root-position voicings (approximate guitar-friendly range) */
const CHORD_PITCHES = {
  D: ["D3", "F#3", "A3"],
  A: ["A2", "C#3", "E3"],
  E: ["E3", "G#3", "B3"],
  G: ["G3", "B3", "D4"],
  Bm: ["B3", "D4", "F#4"],
  "F#m": ["F#3", "A3", "C#4"],
};

function buildTrack(chordNames) {
  const track = new MidiWriter.Track();
  track.setTempo(138);
  track.setTimeSignature(4, 4, 24, 8);
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 24 }));

  for (const name of chordNames) {
    const pitch = CHORD_PITCHES[name];
    if (!pitch) {
      throw new Error(`Unknown chord: ${name}`);
    }
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch,
        duration: "2",
        sequential: false,
        velocity: 78,
      }),
    );
  }
  return track;
}

fs.mkdirSync(outDir, { recursive: true });

const verseChords = ["D", "A", "E", "G", "D", "A", "E"];
const bridgeChords = ["Bm", "F#m", "G", "D", "A", "E"];

const files = [
  ["verse", verseChords],
  ["chorus", verseChords],
  ["bridge", bridgeChords],
];

for (const [name, chords] of files) {
  const track = buildTrack(chords);
  const writer = new MidiWriter.Writer([track]);
  fs.writeFileSync(path.join(outDir, `${name}.mid`), Buffer.from(writer.buildFile()));
}

console.log("Wrote MIDI files to", outDir);
