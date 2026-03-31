"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type * as ToneNS from "tone";
import styles from "@/app/page.module.css";

export const CHORD_PROGRESSION_MIDI_IDS = ["verse", "chorus", "bridge"] as const;
export type ChordProgressionMidiId = (typeof CHORD_PROGRESSION_MIDI_IDS)[number];

export type ChordMidiPlayerHandle = {
  /** Start or jump playback at this chord index (0-based, same order as the chord list). */
  playFromChordIndex: (index: number) => void;
};

function progressionLabel(id: ChordProgressionMidiId): string {
  if (id === "verse") return "Verse";
  if (id === "chorus") return "Chorus";
  return "Bridge";
}

type NoteEventValue = {
  name: string;
  duration: number;
  velocity: number;
  chordIndex: number;
};

type ChordMidiPlayerProps = {
  progressionId: ChordProgressionMidiId;
  /** Called with the 0-based chord index while MIDI plays, or `null` when idle / stopped. */
  onActiveChordIndex?: (index: number | null) => void;
};

export const ChordMidiPlayer = forwardRef<ChordMidiPlayerHandle, ChordMidiPlayerProps>(
  function ChordMidiPlayer({ progressionId, onActiveChordIndex }, ref) {
    const label = progressionLabel(progressionId);
    const loopId = useId();
    const [playing, setPlaying] = useState(false);
    const [loop, setLoop] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const toneRef = useRef<typeof ToneNS | null>(null);
    const synthRef = useRef<ToneNS.PolySynth | null>(null);
    const partRef = useRef<ToneNS.Part | null>(null);
    const endBeatsRef = useRef(0);
    const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressionRef = useRef(progressionId);
    const onActiveChordIndexRef = useRef(onActiveChordIndex);
    onActiveChordIndexRef.current = onActiveChordIndex;

    const loopRef = useRef(loop);
    loopRef.current = loop;

    const playbackEventsRef = useRef<[number, NoteEventValue][]>([]);
    const chordStartsSecRef = useRef<number[]>([]);
    const midiDurationSecRef = useRef(0);
    const bpmRef = useRef(138);
    const playbackOffsetSecRef = useRef(0);

    const lastHighlightChordRef = useRef<number | null>(null);

    progressionRef.current = progressionId;

    const clearStopTimer = () => {
      if (stopTimerRef.current != null) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };

    const clearChordHighlight = useCallback(() => {
      lastHighlightChordRef.current = null;
      onActiveChordIndexRef.current?.(null);
    }, []);

    const resetPlaybackData = useCallback(() => {
      playbackEventsRef.current = [];
      chordStartsSecRef.current = [];
      midiDurationSecRef.current = 0;
      playbackOffsetSecRef.current = 0;
      endBeatsRef.current = 0;
    }, []);

    const teardown = useCallback(() => {
      clearStopTimer();
      clearChordHighlight();
      resetPlaybackData();
      const Tone = toneRef.current;
      if (Tone) {
        try {
          Tone.getDraw().cancel(0);
        } catch {
          /* noop */
        }
        Tone.Transport.stop();
        Tone.Transport.cancel(0);
        Tone.Transport.loop = false;
      }
      partRef.current?.dispose();
      partRef.current = null;
      synthRef.current?.dispose();
      synthRef.current = null;
      setPlaying(false);
    }, [clearChordHighlight, resetPlaybackData]);

    useEffect(() => {
      teardown();
      setError(null);
    }, [progressionId, teardown]);

    useEffect(() => () => teardown(), [teardown]);

    useEffect(() => {
      if (!playing || !toneRef.current) return;
      const Tone = toneRef.current;
      const end = endBeatsRef.current;
      const offsetSec = playbackOffsetSecRef.current;
      const offsetBeats = offsetSec * (bpmRef.current / 60);
      if (loop) {
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = offsetBeats;
        Tone.Transport.loopEnd = end;
      } else {
        Tone.Transport.loop = false;
      }
    }, [loop, playing]);

    const makePart = useCallback((Tone: typeof ToneNS, synth: ToneNS.PolySynth, events: [number, NoteEventValue][]) => {
      lastHighlightChordRef.current = null;
      const draw = Tone.getDraw();
      return new Tone.Part((time, val) => {
        synth.triggerAttackRelease(val.name, val.duration, time, val.velocity);
        if (!onActiveChordIndexRef.current) return;
        if (lastHighlightChordRef.current === val.chordIndex) return;
        lastHighlightChordRef.current = val.chordIndex;
        const idx = val.chordIndex;
        draw.schedule(() => {
          onActiveChordIndexRef.current?.(idx);
        }, time);
      }, events);
    }, []);

    const scheduleEndIfNoLoop = useCallback(
      (offsetSec: number) => {
        clearStopTimer();
        if (loopRef.current) return;
        const remainingSec = midiDurationSecRef.current - offsetSec;
        if (remainingSec <= 0) return;
        stopTimerRef.current = setTimeout(() => {
          teardown();
        }, Math.ceil(remainingSec * 1000) + 200);
      },
      [clearStopTimer, teardown],
    );

    const beginPlayback = useCallback(
      (fromChordIndex: number) => {
        const Tone = toneRef.current;
        const synth = synthRef.current;
        const events = playbackEventsRef.current;
        const starts = chordStartsSecRef.current;
        if (!Tone || !synth || events.length === 0) return;

        const maxIdx = Math.max(0, starts.length - 1);
        const idx = Math.min(Math.max(0, fromChordIndex), maxIdx);
        const offsetSec = starts.length ? starts[idx]! : 0;
        playbackOffsetSecRef.current = offsetSec;
        const offsetBeats = offsetSec * (bpmRef.current / 60);
        const endBeats = endBeatsRef.current;

        try {
          Tone.getDraw().cancel(0);
        } catch {
          /* noop */
        }
        Tone.Transport.stop();
        Tone.Transport.cancel(0);

        partRef.current?.dispose();
        partRef.current = makePart(Tone, synth, events);

        if (loopRef.current) {
          Tone.Transport.loop = true;
          Tone.Transport.loopStart = offsetBeats;
          Tone.Transport.loopEnd = endBeats;
        } else {
          Tone.Transport.loop = false;
        }

        lastHighlightChordRef.current = idx - 1;
        Tone.Transport.seconds = offsetSec;
        partRef.current.start(0);
        Tone.Transport.start();
        setPlaying(true);
        onActiveChordIndexRef.current?.(idx);
        scheduleEndIfNoLoop(offsetSec);
      },
      [makePart, scheduleEndIfNoLoop],
    );

    const loadMidiAndStart = useCallback(
      async (fromChordIndex: number) => {
        setError(null);
        setLoading(true);
        try {
          const [{ Midi }, Tone] = await Promise.all([import("@tonejs/midi"), import("tone")]);

          await Tone.start();

          if (progressionRef.current !== progressionId) {
            Tone.Transport.stop();
            Tone.Transport.cancel(0);
            return;
          }

          teardown();
          toneRef.current = Tone;

          const url = `/midi/${progressionId}.mid`;
          const midi = await Midi.fromUrl(url);
          const bpm = midi.header.tempos[0]?.bpm ?? 138;
          bpmRef.current = bpm;
          Tone.Transport.bpm.value = bpm;

          const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.18, sustain: 0.4, release: 0.55 },
          }).toDestination();
          synth.volume.value = -10;
          synthRef.current = synth;

          const uniqueStarts = new Set<number>();
          for (const track of midi.tracks) {
            for (const note of track.notes) {
              uniqueStarts.add(note.time);
            }
          }
          const sortedStarts = [...uniqueStarts].sort((a, b) => a - b);
          const timeSecToChordIndex = new Map(sortedStarts.map((t, i) => [t, i]));

          const events: [number, NoteEventValue][] = [];
          for (const track of midi.tracks) {
            for (const note of track.notes) {
              const chordIndex = timeSecToChordIndex.get(note.time);
              if (chordIndex === undefined) continue;
              events.push([
                note.time * (bpm / 60),
                {
                  name: note.name,
                  duration: note.duration,
                  velocity: note.velocity,
                  chordIndex,
                },
              ]);
            }
          }
          events.sort((a, b) => a[0] - b[0]);

          playbackEventsRef.current = events;
          chordStartsSecRef.current = sortedStarts;
          midiDurationSecRef.current = midi.duration;

          const endBeats = midi.duration * (bpm / 60);
          endBeatsRef.current = endBeats;

          const clampedStart = Math.min(Math.max(0, fromChordIndex), Math.max(0, sortedStarts.length - 1));
          beginPlayback(sortedStarts.length ? clampedStart : 0);
        } catch (e) {
          console.error(e);
          setError("Could not load or play MIDI — check connection or try again.");
          teardown();
          toneRef.current = null;
        } finally {
          setLoading(false);
        }
      },
      [beginPlayback, progressionId, teardown],
    );

    const playFromChordIndex = useCallback(
      async (index: number) => {
        setError(null);
        if (progressionRef.current !== progressionId) return;

        const hasSession =
          toneRef.current &&
          synthRef.current &&
          playbackEventsRef.current.length > 0 &&
          chordStartsSecRef.current.length > 0;

        if (hasSession && toneRef.current) {
          await toneRef.current.start();
          beginPlayback(index);
          return;
        }

        await loadMidiAndStart(index);
      },
      [beginPlayback, loadMidiAndStart, progressionId],
    );

    useImperativeHandle(
      ref,
      () => ({
        playFromChordIndex: (index: number) => {
          void playFromChordIndex(index);
        },
      }),
      [playFromChordIndex],
    );

    const play = async () => {
      setError(null);
      if (playing) {
        teardown();
        return;
      }
      await loadMidiAndStart(0);
    };

    return (
      <div className={styles.chordMidiPlayer} role="region" aria-label={`MIDI practice player for ${label}`}>
        <div className={styles.chordMidiPlayerHeader}>
          <span className={styles.chordMidiBadge}>MIDI</span>
          <span className={styles.chordMidiTitle}>Play progression · {label}</span>
        </div>
        <p className={styles.chordMidiHint}>
          Fan-made chord pads for practice (not the original studio track). Tap play — your browser may enable audio after the first gesture.{" "}
          <strong>Tip:</strong> tap a chord card to start from that step.
        </p>
        <div className={styles.chordMidiControls}>
          <button
            type="button"
            className={styles.chordMidiPlayBtn}
            onClick={() => void play()}
            disabled={loading}
            aria-pressed={playing}
          >
            {loading ? "Loading…" : playing ? "Stop" : "Play"}
          </button>
          <label className={styles.chordMidiLoopLabel}>
            <input
              id={loopId}
              type="checkbox"
              className={styles.chordMidiLoopInput}
              checked={loop}
              onChange={(ev) => setLoop(ev.target.checked)}
            />
            Loop
          </label>
          <a
            className={styles.chordMidiDownload}
            href={`/midi/${progressionId}.mid`}
            download={`friday-chords-${progressionId}.mid`}
          >
            Download .mid
          </a>
        </div>
        {error ? (
          <p className={styles.chordMidiError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

ChordMidiPlayer.displayName = "ChordMidiPlayer";
