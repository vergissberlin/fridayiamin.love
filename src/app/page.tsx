"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

// --- Begin: Helper Types and Data ---

// Supported language codes for lyric summaries
type LanguageCode = "en" | "es" | "fr" | "de" | "it" | "ja";
type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};
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

// Lyric summaries in different languages (fan-friendly, non-infringing)
const LYRIC_SUMMARIES: Record<LanguageCode, string> = {
  en: "A celebration of the joy and anticipation that Friday brings, contrasting the dullness of the week with the euphoria of love.",
  es: "Una celebración de la alegría y la anticipación que trae el viernes, en contraste con la rutina de la semana y la euforia del amor.",
  fr: "Une célébration de la joie et de l'attente du vendredi, opposant la monotonie de la semaine à l'euphorie de l'amour.",
  de: "Eine Hymne auf die Freude und Vorfreude des Freitags, im Kontrast zur Eintönigkeit der Woche und der Euphorie der Liebe.",
  it: "Una celebrazione della gioia e dell'attesa che porta il venerdì, in contrasto con la monotonia della settimana e l'euforia dell'amore.",
  ja: "金曜日がもたらす喜びと期待を歌い、平日の退屈さと恋の高揚感を対比しています。",
};

// Key lyrics for floating effect
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

function getNextFridayCountdown(now: Date): CountdownParts {
  const target = new Date(now);
  target.setHours(0, 0, 0, 0);
  const day = now.getDay();
  let daysUntil = (5 - day + 7) % 7;
  const isAlreadyFriday =
    day === 5 &&
    (now.getHours() > 0 ||
      now.getMinutes() > 0 ||
      now.getSeconds() > 0 ||
      now.getMilliseconds() > 0);

  if (isAlreadyFriday) {
    daysUntil = 7;
  }

  target.setDate(target.getDate() + daysUntil);
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const daysPart = Math.floor(totalSeconds / 86400);
  const hoursPart = Math.floor((totalSeconds % 86400) / 3600);
  const minutesPart = Math.floor((totalSeconds % 3600) / 60);
  const secondsPart = totalSeconds % 60;

  return {
    days: daysPart,
    hours: hoursPart,
    minutes: minutesPart,
    seconds: secondsPart,
  };
}

// --- End: Helper Types and Data ---

// --- Begin: Decorative/Helper Components ---

const GothicSilhouette = () => (
  <div className={styles.gothicSilhouette} aria-hidden="true">
    {/* Simple SVG for a gothic skyline silhouette */}
    <svg viewBox="0 0 400 60" width="100%" height="60" fill="currentColor">
      <path d="M0 60V40h20v-8h10v8h10V20h10v20h10V10h10v30h10V0h10v40h10V20h10v20h10V5h10v35h10V15h10v25h10V0h10v40h10V10h10v30h10V20h10v20h10V5h10v35h10V15h10v25h10V0h10v40h10V10h10v30h10V20h10v20h10V5h10v35h10V15h10v25h10V0h10v60z"/>
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
      left: `${10 + (index * 20) % 70}%`,
      top: `${10 + (index * 15) % 60}%`,
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
    {/* Neon dots and squiggles */}
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
      <circle cx="10" cy="10" r="4" fill="var(--cyan-neon)" />
      <circle cx="90" cy="30" r="3" fill="var(--yellow-neon)" />
      <rect x="40" y="20" width="8" height="8" rx="2" fill="var(--pink-neon)" />
      <path d="M60 10 Q65 20 70 10 Q75 0 80 10" stroke="var(--green-neon)" strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

const DayProgress = () => {
  const isFriday = new Date().getDay() === 5;

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
          <span role="img" aria-label="sparkle">✨</span>
        </motion.div>
      </div>
    </div>
  );
};

const FridayCountdown = () => {
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(getNextFridayCountdown(new Date()));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!countdown) {
    return null;
  }

  return (
    <div className={styles.fridayCountdown} aria-live="polite">
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
  );
};

const SongInfo = () => (
  <div className={styles.songInfo}>
    <ul>
      <li><strong>Released:</strong> May 1992</li>
      <li><strong>Album:</strong> Wish</li>
      <li><strong>Genre:</strong> Alternative Rock, Jangle Pop</li>
      <li><strong>Writer:</strong> Robert Smith</li>
      <li><strong>Producer:</strong> David M. Allen, Robert Smith</li>
      <li><strong>Chart:</strong> UK #6, US Alt #2</li>
    </ul>
  </div>
);

// --- End: Decorative/Helper Components ---

// --- Begin: New Spotify Player Section ---
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
      <span role="img" aria-label="headphones">🎧</span> Hit play and let the neon joy begin!
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
// --- End: New Spotify Player Section ---

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    const guess = typeof navigator !== "undefined" ? navigator.language : "en";
    const code = guess.toLowerCase().split("-")[0];
    return isLanguageCode(code) ? code : "en";
  });

  return (
    <main className={styles.main}>
      <motion.section className={styles.hero} ref={containerRef}>
        <div className={styles.backgroundLayers}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
        </div>
        
        <motion.div 
          className={styles.heroContent}
          style={{ opacity, scale, y }}
        >
          <motion.h1 
            className={`${styles.title} glitch`}
            data-text="FRIDAY I'M IN LOVE"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            FRIDAY I&apos;M IN LOVE
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.section>

      {/* --- Insert Spotify Player Section after Hero --- */}
      <SpotifyPlayer />

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
          &ldquo;Friday I&apos;m in Love doesn&apos;t follow the typical Cure formula. 
          It&apos;s an anthem of joy in a catalog often defined by melancholy.&rdquo;
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
            &ldquo;Friday I&apos;m in Love&rdquo; is a song by English rock band The Cure, released in May 1992 
            as the lead single from their ninth studio album, Wish (1992). The song was written by 
            Robert Smith and is noted for its upbeat, almost poppy sound, contrasting with the 
            typically darker tone of the band&apos;s work.
          </p>
          <p>
            The music video, directed by Sara撮, features the band performing in a colorful, 
            deliberately low-budget setting with paint splatters and chaotic energy that perfectly 
            captures the song&apos;s spirit.
          </p>
          <p>
            Despite (or because of) its departure from The Cure&apos;s gothic rock roots, it became 
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
          <p className={styles.footerNote}>
            A celebration of love, music, and the joy of Friday
          </p>
        </div>
        <div className={styles.footerDecor}>
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
      </footer>
    </main>
  );
}
