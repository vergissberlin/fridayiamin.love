"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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

function isLanguageCode(code: string): code is LanguageCode {
  return LANGUAGE_OPTIONS.some((opt) => opt.code === code);
}

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

const FRIDAY_CONFETTI = [
  { left: 4, delay: 0, duration: 3.4, size: 7, color: "var(--pink-neon)" },
  { left: 11, delay: 0.3, duration: 2.9, size: 8, color: "var(--yellow-neon)" },
  { left: 18, delay: 0.1, duration: 3.1, size: 6, color: "var(--cyan-neon)" },
  { left: 25, delay: 0.7, duration: 3.5, size: 7, color: "var(--purple-neon)" },
  { left: 33, delay: 0.2, duration: 2.8, size: 9, color: "var(--green-neon)" },
  { left: 41, delay: 0.9, duration: 3.3, size: 6, color: "var(--pink-neon)" },
  { left: 49, delay: 0.4, duration: 3.7, size: 8, color: "var(--cyan-neon)" },
  { left: 56, delay: 0.05, duration: 3, size: 7, color: "var(--yellow-neon)" },
  { left: 64, delay: 0.6, duration: 2.7, size: 8, color: "var(--purple-neon)" },
  { left: 72, delay: 0.45, duration: 3.2, size: 6, color: "var(--green-neon)" },
  { left: 80, delay: 0.8, duration: 3.6, size: 9, color: "var(--pink-neon)" },
  { left: 88, delay: 0.35, duration: 2.95, size: 7, color: "var(--cyan-neon)" },
  { left: 95, delay: 0.15, duration: 3.25, size: 6, color: "var(--yellow-neon)" },
];

const FRIDAY_PARTY_CONFETTI = [
  { left: 6, delay: 0.05, duration: 2.4, size: 8, color: "var(--yellow-neon)" },
  { left: 15, delay: 0.3, duration: 2.1, size: 9, color: "var(--pink-neon)" },
  { left: 27, delay: 0.6, duration: 2.6, size: 7, color: "var(--cyan-neon)" },
  { left: 39, delay: 0.15, duration: 2.3, size: 10, color: "var(--green-neon)" },
  { left: 52, delay: 0.45, duration: 2.5, size: 8, color: "var(--purple-neon)" },
  { left: 64, delay: 0.2, duration: 2.2, size: 9, color: "var(--yellow-neon)" },
  { left: 76, delay: 0.5, duration: 2.7, size: 8, color: "var(--pink-neon)" },
  { left: 88, delay: 0.35, duration: 2.4, size: 7, color: "var(--cyan-neon)" },
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

  const isFriday = now?.getDay() === 5;

  return (
    <div className={styles.dayProgress}>
      {isFriday && (
        <div className={styles.confettiRain} aria-hidden="true">
          {FRIDAY_CONFETTI.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className={styles.confettiPiece}
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                width: `${piece.size}px`,
                height: `${Math.round(piece.size * 1.6)}px`,
                background: piece.color,
              }}
            />
          ))}
        </div>
      )}
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
          whileInView={{ width: "71%" }}
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
      {isFriday && (
        <div className={styles.fridayParty} role="status" aria-label="Today is Friday celebration">
          <div className={styles.fridayPartyConfetti} aria-hidden="true">
            {FRIDAY_PARTY_CONFETTI.map((piece, index) => (
              <span
                key={`${piece.left}-party-${index}`}
                className={styles.fridayPartyConfettiPiece}
                style={{
                  left: `${piece.left}%`,
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                  width: `${piece.size}px`,
                  height: `${Math.round(piece.size * 1.45)}px`,
                  background: piece.color,
                }}
              />
            ))}
          </div>
          <p className={styles.fridayPartyKicker}>it is happening</p>
          <p className={styles.fridayPartyTitle}>Today is Friday</p>
          <p className={styles.fridayPartySubline}>Party mode unlocked for all Friday lovers. ✨</p>
        </div>
      )}
      {!isFriday && (
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
    <p className={styles.spotifyNote}>
      <span role="img" aria-label="headphones">
        🎧
      </span>{" "}
      Hit play and let the neon joy begin!
    </p>
    <p className={styles.spotifyNote}>
      If the embed is blocked, open it on{" "}
      <a
        href="https://open.spotify.com/track/263aNAQCeFSWipk896byo6"
        target="_blank"
        rel="noopener noreferrer"
      >
        Spotify
      </a>
      .
    </p>
  </section>
);

const COVER_VERSIONS = [
  {
    artist: "Yo La Tengo",
    link: "https://www.youtube.com/watch?v=7rT4lR1g7hE",
    note: "Dreamy indie take, live at WFMU",
  },
  {
    artist: "Janet Devlin",
    link: "https://www.youtube.com/watch?v=QvQh2Wl9-0U",
    note: "Acoustic and heartfelt, viral on YouTube",
  },
  {
    artist: "The Bates",
    link: "https://www.youtube.com/watch?v=8w6l0qQw9nE",
    note: "90s punk-pop energy",
  },
  {
    artist: "Phoebe Bridgers",
    link: "https://www.youtube.com/watch?v=0h6rX2uK7lA",
    note: "Haunting, stripped-down live version",
  },
  {
    artist: "Ben Gibbard (Death Cab for Cutie)",
    link: "https://www.youtube.com/watch?v=6k4v3pW9FjA",
    note: "Gentle indie-folk, for SiriusXM",
  },
  {
    artist: "Yoann Casals (Piano Cover)",
    link: "https://www.youtube.com/watch?v=8fXhQv7J4yM",
    note: "Instrumental, melancholic piano",
  },
];

const CoverVersionsSection = () => (
  <section className={styles.coverVersionsSection}>
    <motion.h2
      className={styles.sectionTitle}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Cover Versions
    </motion.h2>
    <p className={styles.coverIntro}>
      The joy of &quot;Friday I&apos;m in Love&quot; has inspired countless covers by artists across
      genres. Here are some fan-favorite reinterpretations:
    </p>
    <ul className={styles.coverList}>
      {COVER_VERSIONS.map((cover, idx) => (
        <motion.li
          key={cover.artist}
          className={styles.coverItem}
          initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * idx, duration: 0.5, type: "spring" }}
          viewport={{ once: true }}
        >
          <a
            href={cover.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.coverArtistLink}
          >
            <span className={styles.coverArtist}>{cover.artist}</span>
          </a>
          <span className={styles.coverNote}>{cover.note}</span>
        </motion.li>
      ))}
    </ul>
    <div className={styles.coverFooter}>
      <span className={styles.coverFooterNote}>
        <span role="img" aria-label="sparkle">
          ✨
        </span>{" "}
        Know a great cover?{" "}
        <a
          href="https://www.youtube.com/results?search_query=friday+im+in+love+cover"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore more on YouTube
        </a>
      </span>
    </div>
  </section>
);

const FAN_RESOURCES = [
  {
    name: "The Cure Official Website",
    url: "https://www.thecure.com/",
    desc: "Official band news, tour dates, and releases",
  },
  {
    name: "Chain of Flowers",
    url: "https://craigjparker.blogspot.com/",
    desc: "Long-running Cure fan blog with news, setlists, and deep dives",
  },
  {
    name: "The Cure on Reddit",
    url: "https://www.reddit.com/r/TheCure/",
    desc: "Active fan community, discussions, and fan art",
  },
  {
    name: "The Cure on Discogs",
    url: "https://www.discogs.com/artist/10898-The-Cure",
    desc: "Comprehensive discography and collector info",
  },
  {
    name: "Friday I'm in Love Wikipedia",
    url: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love",
    desc: "Background, chart info, and song history",
  },
];

const FanResourcesSection = () => (
  <section className={styles.fanResourcesSection}>
    <motion.h2
      className={styles.sectionTitle}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Fan Links & Resources
    </motion.h2>
    <p className={styles.fanResourcesIntro}>
      Dive deeper into The Cure and the world of &quot;Friday I&apos;m in Love&quot; with these
      curated fan resources:
    </p>
    <ul className={styles.fanResourcesList}>
      {FAN_RESOURCES.map((res, idx) => (
        <motion.li
          key={res.url}
          className={styles.fanResourceItem}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * idx, duration: 0.5, type: "spring" }}
          viewport={{ once: true }}
        >
          <a
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fanResourceLink}
          >
            <span className={styles.fanResourceName}>{res.name}</span>
          </a>
          <span className={styles.fanResourceDesc}>{res.desc}</span>
        </motion.li>
      ))}
    </ul>
  </section>
);

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
            tabIndex={0}
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

function getChordFingering(name: string) {
  const chord = CHORDS.find((c) => c.name === name);
  return chord ? chord.fingering : "";
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
        Love&quot;. Grab your guitar and let the neon strumming begin!
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
            tabIndex={0}
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
              key={chord + idx}
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
      <div className={styles.chordTabsFooter}>
        <span>
          <a
            href="https://tabs.ultimate-guitar.com/tab/the-cure/friday-im-in-love-chords-8351"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chordTabsExternalLink}
          >
            Full tabs on Ultimate Guitar
          </a>
        </span>
      </div>
    </section>
  );
};

function ChordDiagram({ chord, fingering }: { chord: string; fingering: string }) {
  const stringPos = [0, 1, 2, 3, 4, 5];
  const fretNumbers = fingering.split("").map((f) => (f === "x" ? null : parseInt(f, 10)));
  const fretted = fretNumbers.filter((n): n is number => typeof n === "number" && n > 0);
  const minFret = fretted.length > 0 ? Math.min(...fretted, 1) : 1;
  const maxFret = fretted.length > 0 ? Math.max(...fretted, 1) : 1;
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

const THEORY_FACTS = [
  {
    label: "Feel",
    value: "Bright, buoyant, jangly",
    note: "A rare Cure single that leans into pure lift-off joy without losing the band&apos;s bittersweet edge.",
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

    <div className={styles.songInfo}>
      <ul>
        <li>
          <strong>Key context:</strong> Commonly played around D major shapes, giving the song its
          open, chiming character.
        </li>
        <li>
          <strong>Hook design:</strong> Repetition makes the title feel immediate, memorable, and
          communal.
        </li>
        <li>
          <strong>Dynamic arc:</strong> Verses feel like a countdown, while the chorus opens into
          emotional release.
        </li>
        <li>
          <strong>Fan takeaway:</strong> It sounds simple on the surface, but the arrangement is
          carefully built for lift, warmth, and singalong momentum.
        </li>
      </ul>
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
            <span className={styles.bandName}>by The Cure</span>
          </motion.div>
        </motion.div>

        <GothicSilhouette />

        <div className={styles.lyricsLayer}>
          {LYRICS.map((lyric, index) => (
            <FloatingLyric key={index} text={lyric} index={index} />
          ))}
        </div>

        <PatternShapes />

        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>Scroll for more</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.section>

      <NewsTicker />
      <SpotifyPlayer />
      <CoverVersionsSection />
      <FanResourcesSection />
      <ChordTabsSection />
      <MusicTheoryBreakdownSection />
      <TourLiveMomentsSection />

      <section className={styles.daySection}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          The Days Fly By
        </motion.h2>

        <p className={styles.sectionIntro}>
          From the grey monotony of Monday to the vibrant explosion of Friday...
        </p>

        <DayProgress />
        <FridayCountdown />

        <motion.p
          className={styles.quote}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          &ldquo;Friday I&apos;m in Love doesn&apos;t follow the typical Cure formula. It&apos;s an
          anthem of joy in a catalog often defined by melancholy.&rdquo;
        </motion.p>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <motion.div
            className={styles.infoCard}
            style={{ background: "linear-gradient(135deg, var(--pink-neon), var(--purple-neon))" }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <h3>Theme</h3>
            <p>Escapism, love, emotional contrast between routine drudgery and exciting liberation</p>
          </motion.div>

          <motion.div
            className={styles.infoCard}
            style={{ background: "linear-gradient(135deg, var(--cyan-neon), var(--green-neon))" }}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <h3>Vibe</h3>
            <p>Joyful chaos, nostalgia, romantic yearning, slightly quirky with gothic undertones</p>
          </motion.div>

          <motion.div
            className={styles.infoCard}
            style={{ background: "linear-gradient(135deg, var(--yellow-neon), var(--orange-neon))" }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <h3>Legacy</h3>
            <p>One of The Cure&apos;s most accessible hits, proving Robert Smith can do happy</p>
          </motion.div>
        </div>

        <SongInfo />
      </section>

      <section className={styles.lyricsSection}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Key Lyrics
        </motion.h2>

        <div className={styles.lyricsDisplay}>
          <AnimatePresence mode="wait">
            <motion.div
              key={1}
              className={styles.lyricBlock}
              initial={{ opacity: 0, x: -100, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: 100, rotate: 5 }}
              transition={{ duration: 0.5 }}
            >
              <p>Friday I&apos;m in love</p>
              <span className={styles.lyricNote}>The refrain that launched a thousand covers</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={2}
              className={styles.lyricBlock}
              initial={{ opacity: 0, x: 100, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -100, rotate: -5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p>Monday I&apos;ll go dancing on</p>
              <span className={styles.lyricNote}>The countdown to bliss begins</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={3}
              className={styles.lyricBlock}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p>Thursday I&apos;ll just stare at the clock</p>
              <span className={styles.lyricNote}>The anticipation is killing us</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={4}
              className={styles.lyricBlock}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p>And I don&apos;t care if Monday&apos;s blue</p>
              <span className={styles.lyricNote}>Love conquers all mundane despair</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.translationWrapper} aria-live="polite">
          <div className={styles.translationHeader}>
            <label className={styles.translationLabel} htmlFor="language-select">
              Language
            </label>
            <select
              id="language-select"
              className={styles.languageSelect}
              value={selectedLanguage}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedLanguage(isLanguageCode(code) ? code : "en");
              }}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <motion.div
            key={selectedLanguage}
            className={styles.lyricSummaryCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className={styles.lyricSummaryText}>Lyric Summary</p>
            <p className={styles.lyricSummaryBody}>{LYRIC_SUMMARIES[selectedLanguage]}</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <motion.div
          className={styles.aboutContent}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>About the Song</h2>
          <p>
            &ldquo;Friday I&apos;m in Love&rdquo; is a song by English rock band The Cure, released
            in May 1992 as the lead single from their ninth studio album, Wish (1992). The song was
            written by Robert Smith and is noted for its upbeat, almost poppy sound, contrasting
            with the typically darker tone of the band&apos;s work.
          </p>
          <p>
            The music video, directed by Tim Pope, features the band performing in a colorful,
            deliberately low-budget setting with paint splatters and chaotic energy that perfectly
            captures the song&apos;s spirit.
          </p>
          <p>
            Despite, or because of, its departure from The Cure&apos;s gothic rock roots, it became
            one of their most successful singles, reaching number six on the UK Singles Chart and
            number two on the Billboard Alternative Songs chart in the US.
          </p>
        </motion.div>

        <div className={styles.decorativeShapes}>
          <motion.div
            className={styles.heartShape}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💜
          </motion.div>
          <motion.div
            className={styles.musicNote}
            animate={{
              y: [-20, 0, -20],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ♫
          </motion.div>
          <motion.div
            className={styles.star}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Made with 💜 for fans of The Cure</p>
          <p className={styles.footerNote}>A celebration of love, music, and the joy of Friday</p>
        </div>
        <div className={styles.footerDecor}>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
      </footer>
    </main>
  );
}
