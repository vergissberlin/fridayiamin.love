"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

const DAYS = [
  { name: "Monday", mood: "grey", color: "#2a2a2a", emoji: "😔" },
  { name: "Tuesday", mood: "grey", color: "#3d3d3d", emoji: "😐" },
  { name: "Wednesday", mood: "grey", color: "#505050", emoji: "🤨" },
  { name: "Thursday", mood: "grey", color: "#6b6b6b", emoji: "😕" },
  { name: "Friday", mood: "vibrant", color: "#ff2d95", emoji: "💖" },
];

const LYRICS = [
  "Friday I’m in Love",
  "doing anything",
  "that I want",
  "any day",
  "of the week",
  "is an equally",
  "good day",
  "to be in love",
  "it's not just",
  "Friday",
  "we are in love",
  "you can see",
  "without a kiss",
  "that we are",
  "stubborn",
  "things with teeth",
  "and we'll be",
  "kissing",
  "just friends",
  "a thousand times",
  "it does show",
  "that time",
  "is taking over me",
  "i'm going out",
  "of my head",
  "and i'm loving",
  "every minute of it",
];

const SongInfo = () => (
  <motion.div 
    className={styles.songInfo}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>Release</span>
      <span className={styles.infoValue}>1992</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>Album</span>
      <span className={styles.infoValue}>Wish</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>Genre</span>
      <span className={styles.infoValue}>Alternative Rock / Pop</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>Label</span>
      <span className={styles.infoValue}>Fiction / Elektra</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>Chart Position</span>
      <span className={styles.infoValue}>UK #6</span>
    </div>
  </motion.div>
);

const FloatingLyric = ({ text, index }: { text: string; index: number }) => {
  const randomX = ((index * 17) % 70) + 5;
  const randomY = ((index * 23) % 60) + 20;
  const randomRotation = ((index * 13) % 30) - 15;
  const randomDelay = index * 0.1;
  
  const colors = ["var(--pink-neon)", "var(--cyan-neon)", "var(--yellow-neon)", "var(--purple-neon)"];
  const randomColor = colors[index % colors.length];
  
  const fonts = ["var(--font-handwritten)", "var(--font-typewriter)", "var(--font-marker)"];
  const randomFont = fonts[index % fonts.length];
  
  const repeatDelay = ((index * 3.7) % 5) + 3;

  return (
    <motion.div
      className={styles.floatingLyric}
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        color: randomColor,
        fontFamily: randomFont,
        transform: `rotate(${randomRotation}deg)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0.8, 1],
        scale: [0, 1.2, 1],
        y: [0, -20, 0, 10, 0],
      }}
      transition={{
        duration: 2,
        delay: randomDelay,
        repeat: Infinity,
        repeatDelay: repeatDelay,
      }}
    >
      {text}
    </motion.div>
  );
};

const DayProgress = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDay((prev) => (prev + 1) % 5);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.dayProgress} ref={containerRef}>
      {DAYS.map((day, index) => (
        <motion.div
          key={day.name}
          className={styles.dayItem}
          style={{
            background: index <= currentDay 
              ? `linear-gradient(135deg, ${day.color}, ${DAYS[currentDay].color})`
              : "#1a1a1a",
          }}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: index === currentDay ? 1.3 : index < currentDay ? 1.1 : 0.9,
            opacity: index <= currentDay ? 1 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        >
          <span className={styles.dayEmoji}>{day.emoji}</span>
          <span className={styles.dayName}>{day.name}</span>
        </motion.div>
      ))}
      <motion.div 
        className={styles.progressBar}
        style={{ 
          width: `${(currentDay / 4) * 100}%`,
          background: `linear-gradient(90deg, var(--pink-neon), var(--purple-neon), var(--cyan-neon))`
        }}
      />
    </div>
  );
};

const GothicSilhouette = () => (
  <svg viewBox="0 0 200 300" className={styles.silhouette}>
    <defs>
      <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--pink-neon)" />
        <stop offset="50%" stopColor="var(--purple-neon)" />
        <stop offset="100%" stopColor="var(--cyan-neon)" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      d="M100 280 C60 280 30 250 30 200 L30 150 C30 120 50 100 70 90 C60 80 55 60 60 45 C70 20 90 10 100 10 C110 10 130 20 140 45 C145 60 140 80 130 90 C150 100 170 120 170 150 L170 200 C170 250 140 280 100 280 Z"
      fill="url(#hairGradient)"
      filter="url(#glow)"
      className={styles.hairPath}
    />
    <circle cx="75" cy="130" r="5" fill="var(--yellow-neon)" className={styles.eye} />
    <circle cx="125" cy="130" r="5" fill="var(--yellow-neon)" className={styles.eye} />
    <path
      d="M85 160 Q100 175 115 160"
      stroke="var(--pink-neon)"
      strokeWidth="3"
      fill="none"
      className={styles.smile}
    />
  </svg>
);

const PatternShapes = () => (
  <div className={styles.patternContainer}>
    <motion.div 
      className={`${styles.shape} ${styles.circle}`}
      style={{ background: "var(--pink-neon)" }}
      animate={{ 
        scale: [1, 1.2, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div 
      className={`${styles.shape} ${styles.square}`}
      style={{ background: "var(--cyan-neon)" }}
      animate={{ 
        scale: [1, 0.8, 1],
        rotate: [0, 45, 0],
      }}
      transition={{ duration: 5, repeat: Infinity }}
    />
    <motion.div 
      className={`${styles.shape} ${styles.triangle}`}
      style={{ 
        borderLeft: "50px solid transparent",
        borderRight: "50px solid transparent",
        borderBottom: `80px solid var(--yellow-neon)`,
      }}
      animate={{ 
        y: [0, -40, 0],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 6, repeat: Infinity }}
    />
    <motion.div 
      className={`${styles.shape} ${styles.diamond}`}
      style={{ background: "var(--purple-neon)" }}
      animate={{ 
        scale: [1, 1.3, 1],
        rotate: [0, 90],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </div>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

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
