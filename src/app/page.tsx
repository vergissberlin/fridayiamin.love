"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { getNextFridayCountdown } from "@/lib/friday-countdown";
import {
  ChordMidiPlayer,
  CHORD_PROGRESSION_MIDI_IDS,
  type ChordMidiPlayerHandle,
} from "@/components/chord-midi-player";
import styles from "./page.module.css";

type LanguageCode = "en" | "es" | "fr" | "de" | "it" | "ja";

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
];

const LYRIC_SUMMARIES: Record<LanguageCode, string> = {
  en: "A celebration of the joy and anticipation that Friday brings, contrasting the dullness of the week with the euphoria of love.",
  es: "Una celebración de la alegría y la anticipación que trae el viernes, en contraste con la rutina de la semana y la euforia del amor.",
  fr: "Une célébration de la joie et de l'attente du vendredi, opposant la monotonie de la semaine à l'euphorie de l'amour.",
  de: "Eine Hymne auf die Freude und Vorfreude des Freitags, im Kontrast zur Eintönigkeit der Woche und der Euphorie der Liebe.",
  it: "Una celebrazione della gioia e dell'attesa che porta il venerdì, in contrasto con la monotonia della settimana e l'euforia dell'amore.",
  ja: "金曜日がもたらす喜びと期待を歌い、平日の退屈さと恋の高揚感を対比しています。",
};

const LYRICS = [
  "I don't care if Monday's blue",
  "Tuesday's grey and Wednesday too",
  "Thursday I don't care about you",
  "It's Friday I'm in love",
];

const TOUR_LIVE_MOMENTS = [
  {
    year: "1992",
    title: "Wish era takes the song worldwide",
    detail:
      "After its release as the lead single from Wish, the song quickly became a live high point and a bright counterweight to the band's darker classics.",
    link: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love",
    source: "Wikipedia song overview",
  },
  {
    year: "1992",
    title: "Tim Pope video turns chaos into pop-goth iconography",
    detail:
      "The colorful, playful video helped define the song's public image and made its joy feel inseparable from The Cure's eccentric visual world.",
    link: "https://www.thecure.com/release/friday-im-in-love/",
    source: "Official release page",
  },
  {
    year: "2016",
    title: "A staple of later-era setlists",
    detail:
      "Even deep into marathon live shows, the song remained one of the moments where arenas shifted from dreamy sway to full communal singalong.",
    link: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    source: "Setlist.fm song stats",
  },
  {
    year: "2023",
    title: "Songs of a Lost World tour keeps the Friday glow alive",
    detail:
      "On recent tours, the track still lands as a burst of warmth inside expansive, emotional sets, proving how durable its optimism is for longtime fans.",
    link: "https://www.thecure.com/tour/",
    source: "Official tour archive",
  },
];

const BEHIND_THE_SCENES_FACTS = [
  {
    kicker: "Wish era",
    title: "A bright single inside a bigger emotional album",
    body:
      "Released in 1992 as the lead single from Wish, the song arrived during a period when The Cure could move between widescreen melancholy and sparkling pop without losing their identity.",
    link: "https://www.thecure.com/release/friday-im-in-love/",
    source: "Official release page",
  },
  {
    kicker: "Robert Smith",
    title: "A famously joyful outlier in the catalog",
    body:
      "Robert Smith has often been associated with darker moods, which is part of why this song still feels so special to fans. Its optimism lands harder because it comes from a band so fluent in longing and shadow.",
    link: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love",
    source: "Song overview",
  },
  {
    kicker: "Tim Pope video",
    title: "Color, chaos, and handmade weirdness",
    body:
      "The video helped cement the song's playful identity: bright paint, visual clutter, and a knowingly off-kilter performance style that made the joy feel unmistakably Cure rather than generic pop polish.",
    link: "https://www.thecure.com/release/friday-im-in-love/",
    source: "Official release page",
  },
  {
    kicker: "Live legacy",
    title: "Still one of the biggest communal singalong moments",
    body:
      "Decades later, the track remains a reliable live eruption. In long, emotionally varied Cure sets, it often acts like a flash of neon warmth that the whole crowd already knows by heart.",
    link: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    source: "Setlist.fm song stats",
  },
];

const NEWS_ITEMS = [
  {
    date: "2024-05-24",
    text: "Robert Smith hints at new The Cure album in 2024 interviews.",
    link: "https://www.nme.com/news/music/the-cure-robert-smith-new-album-update-2024-3650493",
  },
  {
    date: "2024-04-10",
    text: "The Cure announce additional summer festival dates across Europe.",
    link: "https://www.thecure.com/news/",
  },
  {
    date: "2024-02-02",
    text: "Robert Smith speaks out for fair ticket pricing on latest tour.",
    link: "https://pitchfork.com/news/the-cure-robert-smith-ticket-fairness/",
  },
];

const CHORDS = [
  { name: "D", fingering: "xx0232" },
  { name: "A", fingering: "x02220" },
  { name: "E", fingering: "022100" },
  { name: "G", fingering: "320003" },
  { name: "Bm", fingering: "x24432" },
  { name: "F#m", fingering: "244222" },
];

const CHORD_PROGRESSIONS = [
  {
    label: "Verse",
    chords: ["D", "A", "E", "G", "D", "A", "E"],
  },
  {
    label: "Chorus",
    chords: ["D", "A", "E", "G", "D", "A", "E"],
  },
  {
    label: "Bridge",
    chords: ["Bm", "F#m", "G", "D", "A", "E"],
  },
];

const THEORY_FACTS = [
  {
    label: "Feel",
    value: "Bright, buoyant, jangly",
    note: "A rare Cure single that leans into pure lift-off joy without losing the band's bittersweet edge.",
  },
  {
    label: "Tempo",
    value: "Mid-tempo bounce",
    note: "Fast enough to feel like motion, relaxed enough to sing along with a grin.",
  },
  {
    label: "Harmony",
    value: "Major-key glow",
    note: "Open, ringing chords help the chorus feel instantly welcoming and huge.",
  },
  {
    label: "Guitar texture",
    value: "Chime + shimmer",
    note: "Layered strums and clean tones create that unmistakable Wish-era sparkle.",
  },
];

const THEORY_TIMELINE = [
  {
    part: "Verse",
    mood: "Counting the week",
    detail: "The progression moves with a conversational, almost diary-like flow before the hook arrives.",
  },
  {
    part: "Pre-chorus lift",
    mood: "Anticipation",
    detail: "The energy tightens and brightens, like staring at the clock and willing Friday to appear.",
  },
  {
    part: "Chorus",
    mood: "Release",
    detail: "The title lands like a burst of color, turning routine into celebration.",
  },
];

const GothicSilhouette = () => (
  <div className={styles.gothicSilhouette} aria-hidden="true">
    <svg viewBox="0 0 400 60" width="100%" height="60" fill="currentColor">
      <path d="M0 60V40h20v-8h10v8h10V20h10v20h10V10h10v30h10V0h10v40h10V20h10v20h10V5h10v35h10V15h10v25h10V0h10v40h10V10h10v30h10V20h10v20h10V5h10v35h10V15h10v25h10V0h10v60z" />
    </svg>
  </div>
);

const FloatingLyric = ({ text, index }: { text: string; index: number }) => (
  <motion.div
    className={styles.floatingLyric}
    initial={{ opacity: 0, y: 20 * (index % 2 === 0 ? 1 : -1), scale: 0.9 }}
    animate={{ opacity: 0.5, y: [0, -10, 10, 0], scale: 1 }}
    transition={{
      delay: 0.5 + index * 0.2,
      duration: 6 + index,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    }}
    style={{
      left: `${10 + ((index * 20) % 70)}%`,
      top: `${10 + ((index * 15) % 60)}%`,
      position: "absolute",
      pointerEvents: "none",
      fontSize: `${1.1 + index * 0.15}rem`,
      color: "var(--pink-neon)",
      textShadow: "0 0 8px var(--purple-neon), 0 0 2px #fff",
      fontWeight: 600,
      letterSpacing: "0.03em",
      opacity: 0.5,
    }}
    aria-hidden="true"
  >
    {text}
  </motion.div>
);

const PatternShapes = () => (
  <div className={styles.patternShapes} aria-hidden="true">
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
      <circle cx="10" cy="10" r="4" fill="var(--cyan-neon)" />
      <circle cx="90" cy="30" r="3" fill="var(--yellow-neon)" />
      <rect x="40" y="20" width="8" height="8" rx="2" fill="var(--pink-neon)" />
      <path
        d="M60 10 Q65 20 70 10 Q75 0 80 10"
        stroke="var(--green-neon)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  </div>
);

const DayProgress = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.dayProgress}>
      <div className={styles.dayRow}>
        <span className={styles.dayMon}>Mon</span>
        <span className={styles.dayTue}>Tue</span>
        <span className={styles.dayWed}>Wed</span>
        <span className={styles.dayThu}>Thu</span>
        <span className={styles.dayFri}>Fri</span>
        <span className={styles.daySat}>Sat</span>
        <span className={styles.daySun}>Sun</span>
      </div>
      <div className={styles.progressBarBg}>
        <motion.div
          className={styles.progressBar}
          initial={{ width: "0%" }}
          whileInView={{ width: now?.getDay() === 5 ? "71%" : "57%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.div
          className={styles.fridayGlow}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <span role="img" aria-label="sparkle">
            ✨
          </span>
        </motion.div>
      </div>
    </div>
  );
};

const FridayCountdown = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!now) {
    return null;
  }

  const countdown = getNextFridayCountdown(now);
  const isFriday = now.getDay() === 5;

  return (
    <div className={styles.fridayCountdown} aria-live="polite">
      {isFriday ? (
        <div className={styles.fridayParty} role="status" aria-label="Today is Friday celebration">
          <p className={styles.fridayPartyKicker}>it is happening</p>
          <p className={styles.fridayPartyTitle}>Today is Friday</p>
          <p className={styles.fridayPartySubline}>Party mode unlocked for all Friday lovers. ✨</p>
        </div>
      ) : (
        <div>
          <p className={styles.fridayCountdownLabel}>Countdown to next Friday</p>
          <div className={styles.fridayCountdownGrid}>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.days}</span>
              <small>days</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.hours}</span>
              <small>hours</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.minutes}</span>
              <small>minutes</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.seconds}</span>
              <small>seconds</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SongInfo = () => (
  <div className={styles.songInfo}>
    <ul>
      <li>
        <strong>Released:</strong> May 1992
      </li>
      <li>
        <strong>Album:</strong> Wish
      </li>
      <li>
        <strong>Genre:</strong> Alternative Rock, Jangle Pop
      </li>
      <li>
        <strong>Writer:</strong> Robert Smith
      </li>
      <li>
        <strong>Producer:</strong> David M. Allen, Robert Smith
      </li>
      <li>
        <strong>Chart:</strong> UK #6, US Alt #2
      </li>
    </ul>
  </div>
);

const SpotifyPlayer = () => (
  <section className={styles.spotifySection}>
    <h2 className={styles.sectionTitle}>Listen: Friday I&apos;m in Love</h2>
    <div className={styles.spotifyEmbedWrapper}>
      <iframe
        title="Friday I'm in Love - Spotify Player"
        src="https://open.spotify.com/embed/track/263aNAQCeFSWipk896byo6?utm_source=generator"
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{
          borderRadius: "12px",
          border: "2px solid var(--pink-neon)",
          boxShadow: "0 0 24px var(--purple-neon), 0 0 8px var(--cyan-neon)",
          background: "rgba(0,0,0,0.7)",
        }}
      />
    </div>
  </section>
);

const NewsTicker = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className={styles.newsTickerSection} aria-label="Latest Cure News">
      <div className={styles.newsTickerWrapper}>
        <span className={styles.newsTickerLabel}>Cure News</span>
        <AnimatePresence mode="wait">
          <motion.a
            key={NEWS_ITEMS[current].date}
            href={NEWS_ITEMS[current].link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.newsTickerItem}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <span className={styles.newsTickerDate}>{NEWS_ITEMS[current].date}</span>
            <span className={styles.newsTickerText}>{NEWS_ITEMS[current].text}</span>
            <span className={styles.newsTickerArrow}>→</span>
          </motion.a>
        </AnimatePresence>
      </div>
    </section>
  );
};

function getChordFingering(name: string) {
  const chord = CHORDS.find((c) => c.name === name);
  return chord ? chord.fingering : "";
}

function ChordDiagram({ chord, fingering }: { chord: string; fingering: string }) {
  const stringPos = [0, 1, 2, 3, 4, 5];
  const fretNumbers = fingering.split("").map((f) => (f === "x" ? null : parseInt(f, 10)));
  const fretted = fretNumbers.filter((n): n is number => typeof n === "number" && n > 0);
  const minFret = fretted.length > 0 ? Math.min(...fretted) : 1;
  const maxFret = fretted.length > 0 ? Math.max(...fretted) : 1;
  const fretRange = maxFret > 3 ? [minFret, minFret + 3] : [1, 4];

  return (
    <svg
      width="52"
      height="70"
      viewBox="0 0 52 70"
      className={styles.chordTabsDiagram}
      aria-label={`Chord diagram for ${chord}`}
    >
      {stringPos.map((_, i) => (
        <line
          key={`string-${i}`}
          x1={8 + i * 7}
          y1={18}
          x2={8 + i * 7}
          y2={58}
          stroke="#fff"
          strokeWidth={1.2}
        />
      ))}
      {[0, 1, 2, 3].map((f) => (
        <line
          key={`fret-${f}`}
          x1={8}
          y1={18 + f * 10}
          x2={43}
          y2={18 + f * 10}
          stroke="#fff"
          strokeWidth={f === 0 ? 2.2 : 1.2}
        />
      ))}
      {fretNumbers.map((fret, i) =>
        fret === null ? (
          <text
            key={`mute-${i}`}
            x={8 + i * 7}
            y={12}
            fontSize="10"
            fill="var(--pink-neon)"
            textAnchor="middle"
            fontFamily="monospace"
          >
            x
          </text>
        ) : fret === 0 ? (
          <text
            key={`open-${i}`}
            x={8 + i * 7}
            y={12}
            fontSize="10"
            fill="var(--yellow-neon)"
            textAnchor="middle"
            fontFamily="monospace"
          >
            o
          </text>
        ) : (
          <circle
            key={`dot-${i}`}
            cx={8 + i * 7}
            cy={18 + (fret - fretRange[0]) * 10 + 5}
            r={4}
            fill="var(--cyan-neon)"
            stroke="var(--pink-neon)"
            strokeWidth={1}
          />
        ),
      )}
      <text
        x={44}
        y={65}
        fontSize="8"
        fill="var(--purple-neon)"
        textAnchor="end"
        fontFamily="monospace"
      >
        {fretRange[0]}fr
      </text>
    </svg>
  );
}

const ChordTabsSection = () => {
  const [selectedProg, setSelectedProg] = useState(0);
  const [activeMidiChordIndex, setActiveMidiChordIndex] = useState<number | null>(null);
  const chordMidiRef = useRef<ChordMidiPlayerHandle>(null);

  return (
    <section className={styles.chordTabsSection}>
      <motion.h2
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Guitar Tabs & Chords
      </motion.h2>
      <p className={styles.chordTabsIntro}>
        Want to play along? Here are the main chords and progressions for &quot;Friday I&apos;m in
        Love&quot;.
      </p>
      <div className={styles.chordTabsProgNav}>
        {CHORD_PROGRESSIONS.map((prog, idx) => (
          <button
            key={prog.label}
            className={`${styles.chordTabsProgBtn} ${
              selectedProg === idx ? styles.chordTabsProgBtnActive : ""
            }`}
            onClick={() => setSelectedProg(idx)}
            aria-pressed={selectedProg === idx}
            type="button"
          >
            {prog.label}
          </button>
        ))}
      </div>
      <div className={styles.chordTabsProgDisplay}>
        <ChordMidiPlayer
          ref={chordMidiRef}
          progressionId={CHORD_PROGRESSION_MIDI_IDS[selectedProg]}
          onActiveChordIndex={setActiveMidiChordIndex}
        />
        <motion.ul
          className={styles.chordTabsChordList}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          key={selectedProg}
        >
          {CHORD_PROGRESSIONS[selectedProg].chords.map((chord, idx) => (
            <li
              key={`${chord}-${idx}`}
              className={`${styles.chordTabsChordItem} ${
                activeMidiChordIndex === idx ? styles.chordTabsChordItemActive : ""
              }`}
              aria-current={activeMidiChordIndex === idx ? "step" : undefined}
            >
              <button
                type="button"
                className={styles.chordTabsChordHit}
                onClick={() => chordMidiRef.current?.playFromChordIndex(idx)}
                aria-label={`Play progression from chord ${chord}`}
              >
                <span className={styles.chordTabsChordName}>{chord}</span>
                <span className={styles.chordTabsFingering}>{getChordFingering(chord)}</span>
                <ChordDiagram chord={chord} fingering={getChordFingering(chord)} />
              </button>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

const MusicTheoryBreakdownSection = () => (
  <section className={styles.infoSection} aria-labelledby="music-theory-title">
    <motion.h2
      id="music-theory-title"
      className={styles.sectionTitle}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Music Theory Breakdown
    </motion.h2>

    <p className={styles.sectionIntro}>
      Why does &quot;Friday I&apos;m in Love&quot; feel so instantly uplifting?
    </p>

    <div className={styles.infoGrid}>
      {THEORY_FACTS.map((fact, index) => (
        <motion.div
          key={fact.label}
          className={styles.infoCard}
          style={{
            background:
              index % 2 === 0
                ? "linear-gradient(135deg, var(--cyan-neon), var(--purple-neon))"
                : "linear-gradient(135deg, var(--yellow-neon), var(--pink-neon))",
          }}
          whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
        >
          <h3>{fact.label}</h3>
          <p>
            <strong>{fact.value}</strong>
          </p>
          <p>{fact.note}</p>
        </motion.div>
      ))}
    </div>

    <div className={styles.lyricsDisplay} style={{ marginTop: "2rem" }}>
      {THEORY_TIMELINE.map((item, index) => (
        <motion.div
          key={item.part}
          className={styles.lyricBlock}
          initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.08 }}
        >
          <p>{item.part}</p>
          <span className={styles.lyricNote}>
            {item.mood} — {item.detail}
          </span>
        </motion.div>
      ))}
    </div>
  </section>
);

const BehindTheScenesSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.infoSection} aria-labelledby="behind-the-scenes-title">
      <motion.h2
        id="behind-the-scenes-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Behind the Scenes
      </motion.h2>

      <p className={styles.sectionIntro}>
        A quick fan-friendly look at the era, image, and staying power behind
        &quot;Friday I&apos;m in Love&quot;.
      </p>

      <div className={styles.infoGrid}>
        {BEHIND_THE_SCENES_FACTS.map((fact, index) => (
          <motion.article
            key={fact.title}
            className={styles.infoCard}
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 24, rotate: index % 2 === 0 ? -1 : 1 }
            }
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.06, duration: 0.35 }}
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.03, rotate: index % 2 === 0 ? -1 : 1 }
            }
            style={{
              background:
                index % 2 === 0
                  ? "linear-gradient(135deg, rgba(255, 0, 153, 0.9), rgba(102, 0, 255, 0.88))"
                  : "linear-gradient(135deg, rgba(0, 229, 255, 0.88), rgba(255, 230, 0, 0.86))",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {fact.kicker}
            </p>
            <h3>{fact.title}</h3>
            <p>{fact.body}</p>
            <p style={{ marginTop: "0.9rem" }}>
              <a
                href={fact.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chordTabsExternalLink}
              >
                Source: {fact.source}
              </a>
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

const TourLiveMomentsSection = () => (
  <section className={styles.infoSection} aria-labelledby="tour-live-title">
    <motion.h2
      id="tour-live-title"
      className={styles.sectionTitle}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Tour &amp; Live Moments
    </motion.h2>

    <p className={styles.sectionIntro}>
      A tiny timeline of how &quot;Friday I&apos;m in Love&quot; became one of The Cure&apos;s most
      beloved live singalong moments.
    </p>

    <div className={styles.lyricsDisplay}>
      {TOUR_LIVE_MOMENTS.map((item, index) => (
        <motion.article
          key={`${item.year}-${item.title}`}
          className={styles.lyricBlock}
          initial={{ opacity: 0, x: index % 2 === 0 ? -36 : 36, rotate: index % 2 === 0 ? -1 : 1 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.08 }}
        >
          <p>
            {item.year} — {item.title}
          </p>
          <span className={styles.lyricNote}>{item.detail}</span>
          <div style={{ marginTop: "0.9rem" }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.chordTabsExternalLink}>
              Source: {item.source}
            </a>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  return (
    <main className={styles.main}>
      <motion.section className={styles.hero} ref={containerRef}>
        <div className={styles.backgroundLayers}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
        </div>

        <motion.div className={styles.heroContent} style={{ opacity, scale, y }}>
          <motion.h1
            className={`${styles.title} glitch`}
            data-text="FRIDAY I'M IN LOVE"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            FRIDAY I&apos;m in LOVE
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            A love letter to the best day of the week
          </motion.p>

          <motion.div
            className={styles.band}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            The Cure
          </motion.div>

          <DayProgress />
          <FridayCountdown />
        </motion.div>

        <PatternShapes />
        <GothicSilhouette />
        {LYRICS.map((line, index) => (
          <FloatingLyric key={line} text={line} index={index} />
        ))}
      </motion.section>

      <NewsTicker />

      <section className={styles.infoSection}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Song Snapshot
        </motion.h2>
        <SongInfo />
      </section>

      <SpotifyPlayer />

      <section className={styles.infoSection} aria-labelledby="lyrics-meaning-title">
        <motion.h2
          id="lyrics-meaning-title"
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Lyrics &amp; Meaning
        </motion.h2>

        <div className={styles.languageSelector}>
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              className={selectedLanguage === option.code ? styles.activeLanguageButton : styles.languageButton}
              onClick={() => setSelectedLanguage(option.code)}
              aria-pressed={selectedLanguage === option.code}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className={styles.sectionIntro}>{LYRIC_SUMMARIES[selectedLanguage]}</p>

        <div className={styles.lyricsDisplay}>
          {LYRICS.map((line) => (
            <div key={line} className={styles.lyricBlock}>
              <p>{line}</p>
            </div>
          ))}
        </div>
      </section>

      <ChordTabsSection />
      <MusicTheoryBreakdownSection />
      <BehindTheScenesSection />
      <TourLiveMomentsSection />
    </main>
  );
}
