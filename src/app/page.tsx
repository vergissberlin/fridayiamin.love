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

type LyricMomentId = "monday-blue" | "midweek-grey" | "thursday-shrug" | "friday-release";

type FridayQueueMood = "lift-off" | "twilight" | "glitter" | "afterglow";

type FanResourceCategoryId = "all" | "official" | "video" | "live" | "collectors" | "charts";

type CoverVersionId = "david-gray" | "himalaya-records" | "billy-rubin-trio" | "nena" | "choir-choir-choir";

type VideoSceneId = "paint-burst" | "polka-chaos" | "poster-romance" | "confetti-closeup";

type LiveSetSnapshotId = "wish-rush" | "festival-pop" | "marathon-singalong" | "lost-world-glow";

type ListeningLaneId = "stream" | "video" | "live";

type FanResource = {
  category: Exclude<FanResourceCategoryId, "all">;
  title: string;
  source: string;
  href: string;
  description: string;
  whyVisit: string;
};

type LyricMoment = {
  id: LyricMomentId;
  tabLabel: string;
  line: string;
  mood: string;
  headline: string;
  body: string;
  collageCue: string;
  fanNote: string;
};

type FridayQuizQuestion = {
  id: string;
  prompt: string;
  options: {
    result: FridayQueueMood;
    title: string;
    detail: string;
  }[];
};

type CoverMatchQuestion = {
  id: string;
  prompt: string;
  options: {
    result: CoverVersionId;
    title: string;
    detail: string;
  }[];
};

type CoverVersion = {
  id: CoverVersionId;
  label: string;
  description: string;
  artist: string;
  context: string;
  note: string;
  body: string;
  href: string;
  linkLabel: string;
};

type VideoScene = {
  id: VideoSceneId;
  label: string;
  kicker: string;
  headline: string;
  scene: string;
  whyItWorks: string;
  fanMood: string;
  body: string;
  palette: {
    name: string;
    color: string;
  }[];
};

type LiveSetSnapshot = {
  id: LiveSetSnapshotId;
  label: string;
  years: string;
  kicker: string;
  headline: string;
  body: string;
  crowdCue: string;
  setFeel: {
    label: string;
    value: number;
    low: string;
    high: string;
  }[];
  source: string;
  href: string;
  tracks: {
    slot: string;
    title: string;
    note: string;
  }[];
};

type LiveSetFeelMeter = LiveSetSnapshot["setFeel"][number];

type TourLiveMoment = {
  snapshotId: LiveSetSnapshotId;
  year: string;
  title: string;
  setting: string;
  detail: string;
  fanCue: string;
  link: string;
  source: string;
};

type QuickJumpLink = {
  id: string;
  track: string;
  title: string;
  note: string;
};

type WeekdayForecast = {
  dayLabel: string;
  weather: string;
  headline: string;
  body: string;
  cueLabel: string;
  cueHref: string;
};

type ListeningLane = {
  id: ListeningLaneId;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  detailLabel: string;
  detail: string;
  href: string;
  linkLabel: string;
};

type ReleaseFormatId = "seven-inch" | "twelve-inch" | "cd-single";

type ReleaseFormat = {
  id: ReleaseFormatId;
  tabLabel: string;
  format: string;
  kicker: string;
  body: string;
  collectorNote: string;
  href: string;
  linkLabel: string;
  tracks: {
    title: string;
    length: string;
    note: string;
  }[];
};

type SingleCompanionId = "halo" | "scared-as-you" | "strangelove-mix";

type SingleCompanion = {
  id: SingleCompanionId;
  title: string;
  tag: string;
  hook: string;
  body: string;
  bestFor: string;
  formatIds: ReleaseFormatId[];
  href: string;
  linkLabel: string;
};

type ReleaseFormatMatchQuestion = {
  id: string;
  prompt: string;
  options: {
    result: ReleaseFormatId;
    title: string;
    detail: string;
  }[];
};

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

const LYRIC_MOMENTS: LyricMoment[] = [
  {
    id: "monday-blue",
    tabLabel: "Monday",
    line: "I don't care if Monday's blue",
    mood: "Blue Monday shrug",
    headline: "The song starts by acknowledging drag instead of pretending the week feels magical.",
    body:
      "That quick shrug matters. The lyric gives the week a little emotional weight first, so the eventual Friday rush feels earned rather than weightless.",
    collageCue: "Smudged office-grey paper with one neon pink sticker refusing to stay quiet.",
    fanNote: "The Cure let gloom appear for a second, then sidestep it with style.",
  },
  {
    id: "midweek-grey",
    tabLabel: "Tuesday-Wednesday",
    line: "Tuesday's grey and Wednesday too",
    mood: "Midweek blur",
    headline: "The middle of the week is compressed into one washed-out stretch of sameness.",
    body:
      "Bundling Tuesday and Wednesday together makes them feel almost interchangeable. That little monotony trick sharpens the chorus by turning Friday into a real break in the pattern.",
    collageCue: "Photocopied calendar squares fading into each other under cyan marker streaks.",
    fanNote: "It is one of the song's smartest moves: the weekdays feel repetitive, not tragic.",
  },
  {
    id: "thursday-shrug",
    tabLabel: "Thursday",
    line: "Thursday I don't care about you",
    mood: "Dismissive pivot",
    headline: "Thursday is not dramatic; it just gets waved out of the frame.",
    body:
      "Instead of building pressure with grand misery, the lyric simply drops Thursday with a sly dismissal. That playful impatience keeps the song buoyant and makes the turn into Friday feel cheeky.",
    collageCue: "A ripped-out flyer corner tossed off the page with yellow tape still attached.",
    fanNote: "The line lands because it sounds amused, not cruel or self-serious.",
  },
  {
    id: "friday-release",
    tabLabel: "Friday",
    line: "It's Friday I'm in love",
    mood: "Full release",
    headline: "The payoff lands as a rush of relief, romance, and collective recognition all at once.",
    body:
      "After the dull run-up, the title line opens the whole song. Friday becomes both a day and a feeling: the instant when routine breaks and affection floods the room.",
    collageCue: "Confetti-yellow lettering bursting over pink-and-purple poster layers.",
    fanNote: "This is why the chorus works live: everyone already knows exactly when the color arrives.",
  },
];

const LYRICS = LYRIC_MOMENTS.map((moment) => moment.line);

const QUICK_JUMP_LINKS: QuickJumpLink[] = [
  {
    id: "cure-news-reel",
    track: "Track 01",
    title: "News Reel",
    note: "Start with the latest Cure headlines and ease into the collage.",
  },
  {
    id: "song-snapshot",
    track: "Track 02",
    title: "Song Snapshot",
    note: "Grab the core release details before you wander deeper.",
  },
  {
    id: "listen-friday",
    track: "Track 03",
    title: "Listen",
    note: "Choose a studio, video, or live entry point depending on how you want Friday to start.",
  },
  {
    id: "friday-quiz",
    track: "Track 04",
    title: "Quiz",
    note: "Match your current Friday mood to a Cure queue in four quick prompts.",
  },
  {
    id: "friday-cure-queue",
    track: "Track 05",
    title: "Queue",
    note: "Build a themed three-song route that picks up after the single.",
  },
  {
    id: "friday-fan-flyer",
    track: "Track 06",
    title: "Fan Flyer",
    note: "Assemble a one-card plan for your own Cure-themed Friday night.",
  },
  {
    id: "lyrics-meaning",
    track: "Track 07",
    title: "Lyrics",
    note: "Follow the song's weekday-to-Friday emotional turn with short legal excerpts.",
  },
  {
    id: "guitar-tabs",
    track: "Track 08",
    title: "Chords",
    note: "Switch from listening mode to playing mode with diagrams and MIDI practice.",
  },
  {
    id: "cover-versions",
    track: "Track 09",
    title: "Covers",
    note: "Compare a few fan-interesting reinterpretations without leaving the theme behind.",
  },
  {
    id: "fan-resources",
    track: "Track 10",
    title: "Field Guide",
    note: "Finish with links for official history, live stats, and collector context.",
  },
];

const SONG_SNAPSHOT_FACTS = [
  { label: "Released", value: "15 May 1992" },
  { label: "Album", value: "Wish" },
  { label: "Length", value: "3:38" },
  { label: "Label", value: "Fiction / Elektra" },
  { label: "Writers", value: "Bamonte, Gallup, Smith, Thompson, Williams" },
  { label: "Peak glow", value: "UK #6, US Hot 100 #18, US Alt #1" },
];

const RELEASE_FORMATS: ReleaseFormat[] = [
  {
    id: "seven-inch",
    tabLabel: "7-inch",
    format: "7-inch single",
    kicker: "Fastest route to the hook",
    body:
      "The most direct 1992 version keeps the spotlight tight: one bright A-side, one elegant B-side, and no extra detour before the chorus glow has done its work.",
    collectorNote:
      "A great fan entry point if you want the single in its simplest, radio-ready shape with 'Halo' tucked behind it.",
    href: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love#Track_listing",
    linkLabel: "See track listing",
    tracks: [
      { title: "Friday I'm in Love", length: "3:36", note: "The clean, immediate single version." },
      { title: "Halo", length: "3:47", note: "A dreamy B-side that keeps the Wish-era atmosphere intact." },
    ],
  },
  {
    id: "twelve-inch",
    tabLabel: "12-inch",
    format: "12-inch single",
    kicker: "More room for the after-hours version",
    body:
      "The 12-inch stretches the single into a slightly more club-adjacent object by leading with the 'Strangelove Mix' and pairing it with both companion tracks.",
    collectorNote:
      "Best for fans who like seeing how a sparkling pop single gets reframed for a longer, slightly more stylized late-night pass.",
    href: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love#Track_listing",
    linkLabel: "See track listing",
    tracks: [
      { title: "Friday I'm in Love (Strangelove Mix)", length: "5:29", note: "A longer, more stretched-out mix for extra neon drift." },
      { title: "Halo", length: "3:47", note: "Still the graceful bridge back into Wish territory." },
      { title: "Scared as You", length: "4:12", note: "Adds another B-side with a darker edge." },
    ],
  },
  {
    id: "cd-single",
    tabLabel: "CD",
    format: "CD single",
    kicker: "The compact fan-completionist pick",
    body:
      "The CD edition gathers the main single, both B-sides, and the longer mix into one tidy document of how The Cure framed this release moment in 1992.",
    collectorNote:
      "If you want one format that tells the broadest small-scale story of the single, this is the most complete stop.",
    href: "https://www.discogs.com/master/32005",
    linkLabel: "Browse releases on Discogs",
    tracks: [
      { title: "Friday I'm in Love", length: "3:36", note: "The bright centerpiece." },
      { title: "Halo", length: "3:47", note: "Softens the edges without losing momentum." },
      { title: "Scared as You", length: "4:12", note: "Lets the single carry a little more shadow." },
      { title: "Friday I'm in Love (Strangelove Mix)", length: "5:29", note: "A full extra lap around the Friday glow." },
    ],
  },
];

const SINGLE_COMPANIONS: SingleCompanion[] = [
  {
    id: "halo",
    title: "Halo",
    tag: "Dream-lit B-side",
    hook: "The soft-focus comedown that keeps Wish-era romance floating after the chorus flash.",
    body:
      "If the single is the instant when the room turns neon, 'Halo' is the slower walk back through that glow. It stays gentle without losing the emotional lift that makes this era of The Cure feel so open-hearted.",
    bestFor: "Fans who want tenderness, shimmer, and a little extra air around the song.",
    formatIds: ["seven-inch", "twelve-inch", "cd-single"],
    href: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love#Track_listing",
    linkLabel: "Read the track listing",
  },
  {
    id: "scared-as-you",
    title: "Scared as You",
    tag: "Shadow-side B-side",
    hook: "A darker companion cut that lets the single carry a little nervous pulse behind the pop sparkle.",
    body:
      "'Scared as You' reminds you that The Cure never framed 'Friday I'm in Love' as weightless candy. It adds a more guarded emotional edge, which makes the single feel broader and more unmistakably Cure-shaped.",
    bestFor: "Fans who like their Friday joy with some after-hours tension still humming underneath.",
    formatIds: ["twelve-inch", "cd-single"],
    href: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love#Track_listing",
    linkLabel: "Read the track listing",
  },
  {
    id: "strangelove-mix",
    title: "Strangelove Mix",
    tag: "Extended neon detour",
    hook: "The longer mix stretches the single into a more late-night shape without losing its grin.",
    body:
      "This version turns the song from a quick flash into more of a glide. It is still recognizably 'Friday I'm in Love,' but the extra runtime gives the groove more space to drift and wink before the night lets go.",
    bestFor: "Fans who want the single to linger a little longer under club-adjacent lights.",
    formatIds: ["twelve-inch", "cd-single"],
    href: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love#Track_listing",
    linkLabel: "Read the track listing",
  },
];

const RELEASE_FORMAT_RESULT_ORDER: ReleaseFormatId[] = ["seven-inch", "twelve-inch", "cd-single"];

const RELEASE_FORMAT_MATCH_QUESTIONS: ReleaseFormatMatchQuestion[] = [
  {
    id: "entry-point",
    prompt: "How should this copy of Friday arrive?",
    options: [
      {
        result: "seven-inch",
        title: "Quick, bright, and straight to the hook.",
        detail: "I want the leanest release shape and one elegant B-side behind it.",
      },
      {
        result: "twelve-inch",
        title: "With more late-night stretch and remix air.",
        detail: "The longer mix and a little extra room matter more than keeping it compact.",
      },
      {
        result: "cd-single",
        title: "As the most complete small-format snapshot.",
        detail: "Give me the single, both B-sides, and the longer mix in one stop.",
      },
    ],
  },
  {
    id: "fan-lane",
    prompt: "Which fan instinct is strongest here?",
    options: [
      {
        result: "seven-inch",
        title: "I love the classic single object itself.",
        detail: "A clean A-side and B-side pairing is the romance I am chasing.",
      },
      {
        result: "twelve-inch",
        title: "I want the version that feels a little more stylized.",
        detail: "Extra runtime and a slightly moodier framing win me over.",
      },
      {
        result: "cd-single",
        title: "I want the broadest release story in one grab.",
        detail: "Completionist energy beats format minimalism tonight.",
      },
    ],
  },
  {
    id: "afterglow",
    prompt: "What should still be true after the first listen?",
    options: [
      {
        result: "seven-inch",
        title: "The chorus landed fast and never got crowded.",
        detail: "I want the pure pop flash preserved.",
      },
      {
        result: "twelve-inch",
        title: "The song had time to drift a little longer.",
        detail: "I like Friday when it lingers under neon lights.",
      },
      {
        result: "cd-single",
        title: "I got the whole mini-era in one sitting.",
        detail: "A fuller release document is the most satisfying route.",
      },
    ],
  },
];

const TOUR_LIVE_MOMENTS: TourLiveMoment[] = [
  {
    snapshotId: "wish-rush",
    year: "1992-1993",
    title: "Wish launch glow",
    setting: "Album-launch theaters and arenas",
    detail:
      "Right after release, the song felt like a bright flash inside sets still surrounded by deeper Wish material. That contrast helped it read as part of the band's emotional range, not a detached pop novelty.",
    fanCue: "The room lifts fast, then settles back into the broader emotional weather of Wish.",
    link: "https://en.wikipedia.org/wiki/Friday_I%27m_in_Love",
    source: "Wikipedia song overview",
  },
  {
    snapshotId: "festival-pop",
    year: "2000s",
    title: "Festival handshake",
    setting: "Summer fields and broad crossover bills",
    detail:
      "On large festival stages, this becomes the instant where casual listeners and dedicated fans sing from the same place. Its melody does the welcoming without sanding down what makes The Cure special.",
    fanCue: "Arms up early, chorus out beyond the barricade, and a field that suddenly feels smaller.",
    link: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    source: "Setlist.fm song stats",
  },
  {
    snapshotId: "marathon-singalong",
    year: "2016",
    title: "Marathon reset",
    setting: "Three-hour arena marathons",
    detail:
      "By the later marathon years, the song had become a perfectly timed reset button. After shadowier stretches and long emotional arcs, it lets the whole arena grin together without breaking the set's seriousness.",
    fanCue: "You can feel the collective exhale before the first chorus lands.",
    link: "https://www.setlist.fm/stats/the-cure-6bd6b266.html?year=2016",
    source: "2016 live stats",
  },
  {
    snapshotId: "lost-world-glow",
    year: "2023-present",
    title: "Tender beacon",
    setting: "Recent arena and festival runs",
    detail:
      "On recent tours, the song still sparks the singalong, but it also carries more tenderness than pure rush. It lands as proof that brightness has always belonged in the band's story, even inside heavier modern sets.",
    fanCue: "The crowd sings it like a shared memory rather than a novelty break.",
    link: "https://www.thecure.com/tour/",
    source: "Official tour archive",
  },
];

const LIVE_SET_SNAPSHOTS: LiveSetSnapshot[] = [
  {
    id: "wish-rush",
    label: "Wish Rush",
    years: "1992-1993",
    kicker: "Album-launch glow",
    headline: "The single reads like a bright detour without breaking the emotional weather.",
    body:
      "Early Wish-era sequencing often let jangly, openhearted songs cut through heavier material. In that kind of flow, 'Friday I'm in Love' feels less like a novelty pop turn and more like the exact flash of color the set was waiting for.",
    crowdCue: "A quick jump from dreamy attention into full-voice chorus release.",
    setFeel: [
      { label: "Chorus burst", value: 4, low: "Tucked in", high: "Big beacon" },
      { label: "Setlist contrast", value: 4, low: "Blends in", high: "Hard pivot" },
      { label: "Crowd release", value: 4, low: "Soft sway", high: "Full singalong" },
      { label: "Tender glow", value: 2, low: "Pure rush", high: "Soft glow" },
    ],
    source: "Wish release page + 1992 setlist patterns",
    href: "https://www.thecure.com/release/friday-im-in-love/",
    tracks: [
      {
        slot: "Lift",
        title: "High",
        note: "Keeps the guitars airborne so the title track lands like the bigger grin hiding inside the same era.",
      },
      {
        slot: "Singalong",
        title: "Friday I'm in Love",
        note: "The room shifts from sway to instant communal hook recognition.",
      },
      {
        slot: "Stretch-out",
        title: "From the Edge of the Deep Green Sea",
        note: "A reminder that Wish could pivot back into depth and sprawl right after the pop flash.",
      },
    ],
  },
  {
    id: "festival-pop",
    label: "Festival Pop",
    years: "2000s festival runs",
    kicker: "Big-field clarity",
    headline: "On larger outdoor bills, the song works like a universal handshake.",
    body:
      "Festival sets reward immediacy, and this single has it in seconds. Around darker standards and post-punk edges, it becomes the moment where casual listeners and devoted fans suddenly occupy the same melodic space.",
    crowdCue: "Arms up, phones out, and a chorus that reaches beyond the first few rows.",
    setFeel: [
      { label: "Chorus burst", value: 5, low: "Tucked in", high: "Big beacon" },
      { label: "Setlist contrast", value: 3, low: "Blends in", high: "Hard pivot" },
      { label: "Crowd release", value: 5, low: "Soft sway", high: "Full singalong" },
      { label: "Tender glow", value: 2, low: "Pure rush", high: "Soft glow" },
    ],
    source: "Setlist.fm live song stats",
    href: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    tracks: [
      {
        slot: "Arrival",
        title: "Just Like Heaven",
        note: "Another immediate classic that warms up the widest possible crowd without flattening the band's identity.",
      },
      {
        slot: "Centerpiece",
        title: "Friday I'm in Love",
        note: "The cleanest feel-good pivot when the set needs daylight and motion.",
      },
      {
        slot: "Aftershock",
        title: "In Between Days",
        note: "Keeps the bounce moving instead of letting the energy settle too early.",
      },
    ],
  },
  {
    id: "marathon-singalong",
    label: "Marathon Night",
    years: "2016 arena shows",
    kicker: "Deep-set relief",
    headline: "Inside long Cure marathons, the song lands like a perfectly timed exhale.",
    body:
      "When a show ranges across shadowy epics, early singles, and slow-burn emotional peaks, 'Friday I'm in Love' does special work. It resets the room without feeling lightweight, giving the audience one of the night's most collective smiles.",
    crowdCue: "A grin-heavy reset in the middle of a set that has already earned its catharsis.",
    setFeel: [
      { label: "Chorus burst", value: 4, low: "Tucked in", high: "Big beacon" },
      { label: "Setlist contrast", value: 5, low: "Blends in", high: "Hard pivot" },
      { label: "Crowd release", value: 5, low: "Soft sway", high: "Full singalong" },
      { label: "Tender glow", value: 3, low: "Pure rush", high: "Soft glow" },
    ],
    source: "2016 live stats and tour-era references",
    href: "https://www.setlist.fm/stats/the-cure-6bd6b266.html?year=2016",
    tracks: [
      {
        slot: "Weight",
        title: "Pictures of You",
        note: "Opens the emotional space so the brighter single feels even warmer by contrast.",
      },
      {
        slot: "Release",
        title: "Friday I'm in Love",
        note: "The exact point where a marathon show remembers to wink.",
      },
      {
        slot: "Glow-on",
        title: "Close to Me",
        note: "Lets the room stay playful a little longer before drifting elsewhere again.",
      },
    ],
  },
  {
    id: "lost-world-glow",
    label: "Lost World Glow",
    years: "2023-present",
    kicker: "Modern warmth",
    headline: "Recent tours make the song feel tender rather than merely nostalgic.",
    body:
      "Against the emotional scale of newer material, the single becomes a beacon rather than a throwback. It still sparks the singalong, but it also reads as proof that brightness has always belonged in The Cure story.",
    crowdCue: "An affectionate chorus moment that feels earned by everything around it.",
    setFeel: [
      { label: "Chorus burst", value: 3, low: "Tucked in", high: "Big beacon" },
      { label: "Setlist contrast", value: 2, low: "Blends in", high: "Hard pivot" },
      { label: "Crowd release", value: 4, low: "Soft sway", high: "Full singalong" },
      { label: "Tender glow", value: 5, low: "Pure rush", high: "Soft glow" },
    ],
    source: "Official tour archive",
    href: "https://www.thecure.com/tour/",
    tracks: [
      {
        slot: "Prelude",
        title: "Alone",
        note: "Recent-era atmosphere makes the eventual jangle feel even more generous.",
      },
      {
        slot: "Beacon",
        title: "Friday I'm in Love",
        note: "Less sugar rush, more shared warmth inside a very emotional night.",
      },
      {
        slot: "Afterglow",
        title: "Lovesong",
        note: "Keeps the intimacy close after the crowd-wide singalong breaks open.",
      },
    ],
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

const VIDEO_SCENES: VideoScene[] = [
  {
    id: "paint-burst",
    label: "Paint Burst",
    kicker: "Handmade pop-goth",
    headline: "The video sells joy by making the set feel gleefully unfinished.",
    scene: "Paint splashes, rough edges, and a stage that looks built from pure impulse.",
    whyItWorks: "The messiness keeps the song bright without sanding off The Cure's weirdness.",
    fanMood: "Best for fans who love the band when the charm feels slightly off-center and human.",
    body:
      "Instead of smoothing the song into clean pop polish, the clip leans into obvious textures, visible craft, and playful clutter. That homemade energy makes the chorus feel earned rather than manufactured.",
    palette: [
      { name: "Neon pink", color: "#ff2d95" },
      { name: "Poster cyan", color: "#00f0ff" },
      { name: "Stage-black ink", color: "#120814" },
    ],
  },
  {
    id: "polka-chaos",
    label: "Polka Chaos",
    kicker: "Tim Pope playfulness",
    headline: "Patterns keep colliding so the whole song feels like motion, not polish.",
    scene: "Spots, stripes, and cutout shapes piling into each other like a moving scrapbook.",
    whyItWorks: "The visual overload mirrors the rush of hitting Friday after a dull week.",
    fanMood: "Perfect if your favorite Cure moments balance sincerity with a sly grin.",
    body:
      "The video's pattern clashes never settle into one tidy system. That constant visual bounce gives the single a cartoon-romantic velocity and helps its optimism feel gloriously excessive instead of generic.",
    palette: [
      { name: "Butter yellow", color: "#ffee00" },
      { name: "Marker purple", color: "#bf00ff" },
      { name: "Milk-white paper", color: "#f6f1ff" },
    ],
  },
  {
    id: "poster-romance",
    label: "Poster Romance",
    kicker: "Alt-pop tenderness",
    headline: "Even at its loudest, the clip keeps a sweet center.",
    scene: "Band portraits and collage framing that feel half teen-magazine pinup, half art-school prank.",
    whyItWorks: "It lets the song stay romantic without losing the band identity fans came for.",
    fanMood: "Choose this angle if the hook hits you as affectionate first and celebratory second.",
    body:
      "A lot of Cure imagery trades in longing, distance, and shadows. Here the framing turns toward warmth and directness, but the handmade collage treatment stops that sweetness from becoming flat or anonymous.",
    palette: [
      { name: "Lipstick red", color: "#ff0040" },
      { name: "Warm cream", color: "#fff5cf" },
      { name: "Midnight plum", color: "#32103d" },
    ],
  },
  {
    id: "confetti-closeup",
    label: "Confetti Close-Up",
    kicker: "Singalong release",
    headline: "Close framing turns the chorus into a shared grin instead of a distant spectacle.",
    scene: "Faces, confetti energy, and those sudden bursts where the room seems to tip into the title line.",
    whyItWorks: "The clip keeps returning to people, which makes the song feel communal and replayable.",
    fanMood: "Best when you love how the track transforms a whole crowd in one chorus.",
    body:
      "For all its visual noise, the video knows when to come back to expression and presence. Those tighter moments give the song its emotional anchor: not just Friday as a concept, but Friday as a feeling people can recognize together.",
    palette: [
      { name: "Glow yellow", color: "#ffe45c" },
      { name: "Confetti green", color: "#39ff14" },
      { name: "Night-sky navy", color: "#111d35" },
    ],
  },
];

const NEWS_ITEMS = [
  {
    date: "2024-05-24",
    source: "NME",
    text: "Robert Smith hints at new The Cure album in 2024 interviews.",
    link: "https://www.nme.com/news/music/the-cure-robert-smith-new-album-update-2024-3650493",
  },
  {
    date: "2024-04-10",
    source: "The Cure",
    text: "The Cure announce additional summer festival dates across Europe.",
    link: "https://www.thecure.com/news/",
  },
  {
    date: "2024-02-02",
    source: "Pitchfork",
    text: "Robert Smith speaks out for fair ticket pricing on latest tour.",
    link: "https://pitchfork.com/news/the-cure-robert-smith-ticket-fairness/",
  },
];

const FAN_RESOURCES: FanResource[] = [
  {
    category: "official",
    title: "Official release page",
    source: "Official",
    href: "https://www.thecure.com/release/friday-im-in-love/",
    description:
      "Start with The Cure's own archive page for the single and keep the site anchored in the band's official history.",
    whyVisit: "Best first stop if you want the song framed by the band's own archive and release history.",
  },
  {
    category: "video",
    title: "Tim Pope video on YouTube",
    source: "Video",
    href: "https://www.youtube.com/watch?v=mGgMZpGYiy8",
    description:
      "Jump straight into the song's color-soaked, handmade-chaos visual world and revisit the clip that fixed its playful identity.",
    whyVisit: "Ideal when your Friday mood needs the full visual collage, not just the chorus in your head.",
  },
  {
    category: "live",
    title: "Tour archive",
    source: "Live",
    href: "https://www.thecure.com/tour/",
    description:
      "Check the band's current and archived touring universe when you want to trace where Friday still glows inside modern Cure setlists.",
    whyVisit: "Use this when you want to follow the song into the broader live history of The Cure.",
  },
  {
    category: "live",
    title: "Setlist.fm song stats",
    source: "Live Data",
    href: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    description:
      "See how often the song appears on stage and use the stats page as a quick live-history rabbit hole.",
    whyVisit: "The right pick for fans who want numbers, recurrence, and live-era patterns at a glance.",
  },
  {
    category: "collectors",
    title: "Discogs master release",
    source: "Collectors",
    href: "https://www.discogs.com/master/32005",
    description:
      "Browse formats, mixes, and pressing variations if your Friday fandom leans toward sleeves, editions, and release archaeology.",
    whyVisit: "A collector-friendly route for artwork, formats, and release-detail rabbit holes.",
  },
  {
    category: "charts",
    title: "Official Charts snapshot",
    source: "Charts",
    href: "https://www.officialcharts.com/charts/singles-chart/19920606/7501/",
    description:
      "Open the UK chart week where the single peaked and add a little chart-era context to the glow of 1992.",
    whyVisit: "Choose this if you want a quick dose of 1992 chart context around the single's pop crossover moment.",
  },
];

const FAN_RESOURCE_FILTERS: {
  id: FanResourceCategoryId;
  label: string;
  eyebrow: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "All stops",
    eyebrow: "Whole collage",
    description: "Keep every branch of the Friday rabbit hole in view, from official history to collecting detours.",
  },
  {
    id: "official",
    label: "Official",
    eyebrow: "Band archive",
    description: "Start with The Cure's own framing when you want the cleanest, most grounded context first.",
  },
  {
    id: "video",
    label: "Video",
    eyebrow: "Visual chaos",
    description: "Go straight to the Tim Pope clip if your next step is color, collage, and handmade strangeness.",
  },
  {
    id: "live",
    label: "Live",
    eyebrow: "Stage glow",
    description: "Follow the song across tours and setlists when you want the communal singalong version of Friday.",
  },
  {
    id: "collectors",
    label: "Collectors",
    eyebrow: "Shelf archaeology",
    description: "Zoom into formats, pressings, and release details if your fandom lives in sleeves and editions.",
  },
  {
    id: "charts",
    label: "Charts",
    eyebrow: "1992 snapshot",
    description: "Open the chart-era lane when you want to place the single inside its original pop-week context.",
  },
];

const COVER_VERSIONS: CoverVersion[] = [
  {
    id: "david-gray",
    label: "Live Rush",
    description: "Big-stage joy with a little extra grin and grit.",
    artist: "David Gray",
    context: "2005 live performance",
    note: "For when you want the chorus to feel arena-sized without losing its warmth.",
    body:
      "Cover Me singled out David Gray's Hammersmith Apollo performance as a version that goes fully showman without flattening the song's sweetness. It keeps the bounce, but trades some Cure shimmer for the feeling of a crowd already halfway into the singalong.",
    href: "https://www.youtube.com/results?search_query=David+Gray+Friday+I%27m+In+Love",
    linkLabel: "Search David Gray's take",
  },
  {
    id: "himalaya-records",
    label: "Soft Focus",
    description: "A gentler read with airy phrasing and less pop sprint.",
    artist: "Himalaya Records",
    context: "Spanish indie interpretation",
    note: "Best when Friday feels less like confetti and more like neon seen through rain.",
    body:
      "Cover Me highlighted Himalaya Records for approaching the song from a softer angle. The arrangement relaxes the original's forward motion and lets the melody breathe, which is useful if you love the song's optimism but want it wrapped in something more delicate.",
    href: "https://www.youtube.com/results?search_query=Himalaya+Records+Friday+I%27m+In+Love",
    linkLabel: "Search Himalaya Records",
  },
  {
    id: "billy-rubin-trio",
    label: "Hot Jazz",
    description: "A playful swing detour for the fan who likes curveballs.",
    artist: "Billy Rubin Trio",
    context: "1920s-style jazz reinterpretation",
    note: "A delightfully sideways route if you want the hook recast as a lounge-floor strut.",
    body:
      "The Billy Rubin Trio version was praised by Cover Me for pushing the song into hot-jazz territory. It proves how sturdy Robert Smith's melody really is: even with the rhythm and attitude rewritten, the core rush of relief and romance still comes through.",
    href: "https://www.youtube.com/results?search_query=Billy+Rubin+Trio+Friday+I%27m+In+Love",
    linkLabel: "Search Billy Rubin Trio",
  },
  {
    id: "nena",
    label: "Teen-Movie Glow",
    description: "Bright and glossy, like a lost alt-pop soundtrack cut.",
    artist: "Nena",
    context: "2007 album cover",
    note: "Choose this lane if you want the song's sunny side pushed right to the front.",
    body:
      "Cover Me described Nena's version as sounding like a missing track from a '90s teen-movie soundtrack, which fits the song surprisingly well. It leans into the tune's accessible pop shape and lets the romantic punchline land with almost zero melancholy fog around it.",
    href: "https://www.youtube.com/results?search_query=Nena+Friday+I%27m+In+Love",
    linkLabel: "Search Nena's version",
  },
  {
    id: "choir-choir-choir",
    label: "Crowd Lift",
    description: "Human-voice overload for maximum communal release.",
    artist: "Choir! Choir! Choir!",
    context: "Mass singalong arrangement",
    note: "The best pick if your favorite part of the song is hearing everyone reach the title together.",
    body:
      "Choir! Choir! Choir! turn the song into a collective exhale. Cover Me called out how the arrangement starts modestly, then builds into the kind of many-voice swell that makes the chorus feel less like a private mood and more like a shared ritual.",
    href: "https://www.youtube.com/results?search_query=Choir+Choir+Choir+Friday+I%27m+In+Love",
    linkLabel: "Search Choir! Choir! Choir!",
  },
];

const COVER_VERSION_RESULT_ORDER: CoverVersionId[] = [
  "david-gray",
  "himalaya-records",
  "billy-rubin-trio",
  "nena",
  "choir-choir-choir",
];

const COVER_MATCH_QUESTIONS: CoverMatchQuestion[] = [
  {
    id: "arrival",
    prompt: "How should the cover arrive?",
    options: [
      {
        result: "david-gray",
        title: "Like the crowd is already halfway through the chorus.",
        detail: "Big-stage warmth and a little extra grit.",
      },
      {
        result: "himalaya-records",
        title: "Like neon seen through rain on a train window.",
        detail: "Soft edges, slower breath, and a gentler glow.",
      },
      {
        result: "billy-rubin-trio",
        title: "Like a sideways detour with a knowing grin.",
        detail: "A playful swing if you want the song recut at an angle.",
      },
      {
        result: "nena",
        title: "Like a glossy alt-pop montage from another decade.",
        detail: "Bright, direct, and all-in on the hook.",
      },
      {
        result: "choir-choir-choir",
        title: "Like everybody in the room gets a microphone.",
        detail: "Maximum communal lift and full human-voice release.",
      },
    ],
  },
  {
    id: "setting",
    prompt: "Where does this version belong tonight?",
    options: [
      {
        result: "david-gray",
        title: "A festival field right before sunset.",
        detail: "You want immediate recognition and open-air energy.",
      },
      {
        result: "himalaya-records",
        title: "A small bar with condensation on the windows.",
        detail: "The hook should feel intimate, not explosive.",
      },
      {
        result: "billy-rubin-trio",
        title: "A lounge with impossible wallpaper and excellent timing.",
        detail: "You are here for charm, texture, and curveballs.",
      },
      {
        result: "nena",
        title: "The perfect scene change in a bright pop romance.",
        detail: "You want the melody pushed right to the front.",
      },
      {
        result: "choir-choir-choir",
        title: "A room full of friends singing the title line together.",
        detail: "The best part is everyone arriving at the same feeling.",
      },
    ],
  },
  {
    id: "aftereffect",
    prompt: "What should the cover leave behind?",
    options: [
      {
        result: "david-gray",
        title: "A bigger grin than the original started with.",
        detail: "More live rush, still recognizably warm.",
      },
      {
        result: "himalaya-records",
        title: "A softer comedown that lingers for a while.",
        detail: "Friday, but with a little mist around it.",
      },
      {
        result: "billy-rubin-trio",
        title: "The feeling that this melody can survive any costume change.",
        detail: "A cover for fans who love structural mischief.",
      },
      {
        result: "nena",
        title: "Pure candy-color momentum.",
        detail: "Less shadow, more sparkle, no hesitation.",
      },
      {
        result: "choir-choir-choir",
        title: "That shared-release shiver from a room singing in sync.",
        detail: "A chorus that feels bigger because everybody is inside it.",
      },
    ],
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

const FRIDAY_CURE_QUEUES: {
  mood: FridayQueueMood;
  label: string;
  time: string;
  kicker: string;
  headline: string;
  description: string;
  tracks: {
    title: string;
    era: string;
    note: string;
    link: string;
  }[];
}[] = [
  {
    mood: "lift-off",
    label: "Lift-Off",
    time: "Golden-hour glow",
    kicker: "For the instant grin",
    headline: "Keep the chorus high and the sky even brighter.",
    description:
      "Start with songs that share Friday's open-armed rush: ringing guitars, huge hooks, and the feeling that the whole week just fell away.",
    tracks: [
      {
        title: "Just Like Heaven",
        era: "1987",
        note: "The purest next-step sugar rush: euphoric, romantic, and impossible not to sing with.",
        link: "https://open.spotify.com/search/The%20Cure%20Just%20Like%20Heaven",
      },
      {
        title: "High",
        era: "1992",
        note: "Another Wish-era uplift, all buoyant guitar shimmer and weightless momentum.",
        link: "https://open.spotify.com/search/The%20Cure%20High",
      },
      {
        title: "In Between Days",
        era: "1985",
        note: "A faster jangle-pop sprint when you want the Friday bounce to keep moving.",
        link: "https://open.spotify.com/search/The%20Cure%20In%20Between%20Days",
      },
    ],
  },
  {
    mood: "twilight",
    label: "Twilight",
    time: "Neon after sunset",
    kicker: "For the dreamy comedown",
    headline: "Trade the rush for a softer glow without losing the feeling.",
    description:
      "This path leans into the band's widescreen romance: slower, deeper, and perfect once the party starts turning reflective.",
    tracks: [
      {
        title: "Plainsong",
        era: "1989",
        note: "A cathedral-sized opener that makes the room feel bigger and the night feel cinematic.",
        link: "https://open.spotify.com/search/The%20Cure%20Plainsong",
      },
      {
        title: "Pictures of You",
        era: "1989",
        note: "Tender and expansive, with the same emotional sincerity stretched into wistful grandeur.",
        link: "https://open.spotify.com/search/The%20Cure%20Pictures%20of%20You",
      },
      {
        title: "A Letter to Elise",
        era: "1992",
        note: "A graceful late-evening turn when Friday starts sounding a little more bittersweet.",
        link: "https://open.spotify.com/search/The%20Cure%20A%20Letter%20to%20Elise",
      },
    ],
  },
  {
    mood: "glitter",
    label: "Glitter",
    time: "Confetti and eyeliner",
    kicker: "For the playful weirdness",
    headline: "Lean into the camp, charm, and off-kilter pop genius.",
    description:
      "If Friday makes you want color, movement, and a little mischief, this is the route with the biggest wink in it.",
    tracks: [
      {
        title: "Close to Me",
        era: "1985",
        note: "All wobble, pulse, and claustrophobic fun, like dancing in a room painted hot pink.",
        link: "https://open.spotify.com/search/The%20Cure%20Close%20to%20Me",
      },
      {
        title: "The Lovecats",
        era: "1983",
        note: "Playful swagger, cartoon romance, and a reminder that The Cure can be gloriously unserious.",
        link: "https://open.spotify.com/search/The%20Cure%20The%20Lovecats",
      },
      {
        title: "Why Can't I Be You?",
        era: "1987",
        note: "A bright, extroverted burst of flirtation for when the mirrorball energy takes over.",
        link: "https://open.spotify.com/search/The%20Cure%20Why%20Can%27t%20I%20Be%20You%3F",
      },
    ],
  },
  {
    mood: "afterglow",
    label: "Afterglow",
    time: "Last train home",
    kicker: "For the soft landing",
    headline: "Hold onto the warmth after the neon starts fading.",
    description:
      "These songs keep Friday's heart intact while easing into something more intimate, affectionate, and quietly radiant.",
    tracks: [
      {
        title: "Lovesong",
        era: "1989",
        note: "Direct, devoted, and timeless: the emotional center of a late-night Cure run.",
        link: "https://open.spotify.com/search/The%20Cure%20Lovesong",
      },
      {
        title: "Catch",
        era: "1987",
        note: "A delicate, wistful pause that still feels lit by the same romantic spark.",
        link: "https://open.spotify.com/search/The%20Cure%20Catch",
      },
      {
        title: "Mint Car",
        era: "1996",
        note: "A later-era shot of optimism if you want Friday's sunshine to linger just a little longer.",
        link: "https://open.spotify.com/search/The%20Cure%20Mint%20Car",
      },
    ],
  },
];

const OFFICIAL_VIDEO_URL = "https://www.youtube.com/watch?v=mGgMZpGYiy8";

const SPOTIFY_TRACK_URL = "https://open.spotify.com/track/263aNAQCeFSWipk896byo6";

const LISTENING_LANES: ListeningLane[] = [
  {
    id: "stream",
    label: "Studio",
    eyebrow: "Wish-era single",
    headline: "Start with the clean jangle and let the chorus hit fast.",
    body:
      "The original recording is still the quickest route to that instant Friday lift: bright guitars, open air, and the feeling that the week just cracked apart.",
    detailLabel: "Best when",
    detail: "you want the studio version first and the shortest path to the hook everyone already knows.",
    href: SPOTIFY_TRACK_URL,
    linkLabel: "Open on Spotify",
  },
  {
    id: "video",
    label: "Video",
    eyebrow: "Tim Pope collage",
    headline: "Watch the song turn into paint, pattern, and playful chaos.",
    body:
      "The official clip keeps the joy handmade instead of polished. It is bright, odd, affectionate, and one of the clearest reasons the single still feels unmistakably Cure.",
    detailLabel: "Best when",
    detail: "the visual clutter is part of the memory and you want Friday to arrive in full color, not just audio.",
    href: OFFICIAL_VIDEO_URL,
    linkLabel: "Open the official video",
  },
  {
    id: "live",
    label: "Live",
    eyebrow: "Crowd-wide singalong",
    headline: "Trace how the song keeps detonating warmth on stage.",
    body:
      "Live, the single stops being only a pop outlier and starts reading like a shared release valve. The stats and tour archive show how often it still arrives as the room-reset grin in long Cure sets.",
    detailLabel: "Best when",
    detail: "your favorite version of the song is the one that turns thousands of voices into one title-line release.",
    href: "https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5",
    linkLabel: "Open live stats",
  },
];

const DEFAULT_WEEKDAY_FORECAST: WeekdayForecast = {
  dayLabel: "Any Day",
  weather: "Fan weather check",
  headline: "The single still knows how to turn the week toward color.",
  body:
    "Use this card as a fast way back into the site whenever you need a little Friday lift, whether you want the studio hook, the video chaos, or the wider Cure rabbit hole.",
  cueLabel: "Open Listen Lounge",
  cueHref: "#listen-friday",
};

const WEEKDAY_FORECASTS: WeekdayForecast[] = [
  {
    dayLabel: "Sunday",
    weather: "Afterglow planning",
    headline: "Sunday is for letting the glow settle and deciding how next Friday should feel.",
    body:
      "Take the softer landing seriously: this is the best moment to choose your next rabbit hole before the week speeds back up.",
    cueLabel: "Browse the Friday Field Guide",
    cueHref: "#fan-resources",
  },
  {
    dayLabel: "Monday",
    weather: "Blue Monday shrug",
    headline: "The song already gave Monday permission to be a little blue.",
    body:
      "Instead of fighting the mood, lean into the line that opens the whole story and watch how The Cure turn drag into anticipation.",
    cueLabel: "Decode the Monday lyric moment",
    cueHref: "#lyrics-meaning",
  },
  {
    dayLabel: "Tuesday",
    weather: "Grey-room reset",
    headline: "Tuesday can stay grey; the trick is keeping one bright route in view.",
    body:
      "If the week feels flat, borrow a gentler Cure queue and let the night open up a little earlier than planned.",
    cueLabel: "Jump to the Friday Cure Queue",
    cueHref: "#friday-cure-queue",
  },
  {
    dayLabel: "Wednesday",
    weather: "Midweek blur",
    headline: "When the calendar starts smearing together, go for the most playful collage energy.",
    body:
      "A visual detour can work better than pure efficiency here. Break the blur with pattern clashes, paint bursts, and a little Cure weirdness.",
    cueLabel: "Open the Video Scene Decoder",
    cueHref: "#video-scene-decoder",
  },
  {
    dayLabel: "Thursday",
    weather: "Shrug energy",
    headline: "Thursday only needs one move: stop caring and start lining up the chorus.",
    body:
      "This is the day for the quickest route back to the hook, so keep the setup simple and let the single do the release work.",
    cueLabel: "Start in the Listen Lounge",
    cueHref: "#listen-friday",
  },
  {
    dayLabel: "Friday",
    weather: "Full release",
    headline: "Today belongs to the title line.",
    body:
      "Pick the version that feels biggest right now: clean studio jangle, Tim Pope collage chaos, or a crowd-wide live grin. The whole site is ready for all three.",
    cueLabel: "Play the official video",
    cueHref: "https://www.youtube.com/watch?v=mGgMZpGYiy8",
  },
  {
    dayLabel: "Saturday",
    weather: "Crowd-memory glow",
    headline: "Saturday is for the afterimage of last night's singalong.",
    body:
      "Stay with the warmth a little longer and trace how the song keeps landing live across different Cure eras and crowds.",
    cueLabel: "Follow the Tour & Live Moments",
    cueHref: "#tour-live-moments",
  },
];

const FRIDAY_QUIZ_RESULT_ORDER: FridayQueueMood[] = ["lift-off", "twilight", "glitter", "afterglow"];

const FRIDAY_QUIZ_QUESTIONS: FridayQuizQuestion[] = [
  {
    id: "start",
    prompt: "Friday starts feeling real when...",
    options: [
      {
        result: "lift-off",
        title: "The group chat finally wakes up.",
        detail: "You want immediate sparkle, open windows, and the fastest route to a grin.",
      },
      {
        result: "twilight",
        title: "The sky turns blue-violet after work.",
        detail: "You like your Friday softened at the edges and lit from within.",
      },
      {
        result: "glitter",
        title: "The outfit gets louder than the room.",
        detail: "A little camp, a little mischief, and a lot of movement feels exactly right.",
      },
      {
        result: "afterglow",
        title: "You are already thinking about the walk home.",
        detail: "Warmth matters more than chaos, and you want the feeling to linger.",
      },
    ],
  },
  {
    id: "scene",
    prompt: "Pick the Friday scene that sounds most like you.",
    options: [
      {
        result: "lift-off",
        title: "Sunlight on a train ride to somewhere fun.",
        detail: "Momentum, jangly guitars, and that sense that the weekend just cracked open.",
      },
      {
        result: "twilight",
        title: "Streetlights, reflections, and a slow first drink.",
        detail: "You want a widescreen mood that stays romantic instead of restless.",
      },
      {
        result: "glitter",
        title: "Confetti floor, eyeliner mirror, impossible shoes.",
        detail: "Friday should feel theatrical, playful, and knowingly a little over the top.",
      },
      {
        result: "afterglow",
        title: "Late-night diner or a quiet cab ride.",
        detail: "You are here for affection, decompression, and the soft landing afterward.",
      },
    ],
  },
  {
    id: "favorite-detail",
    prompt: "What do you love most about The Cure in this mode?",
    options: [
      {
        result: "lift-off",
        title: "The bright upward rush.",
        detail: "Hooks, shimmer, and enough buoyancy to make the whole room feel lighter.",
      },
      {
        result: "twilight",
        title: "The emotional weather.",
        detail: "A dreamy, floating sadness that still leaves room for tenderness.",
      },
      {
        result: "glitter",
        title: "The wink in the weirdness.",
        detail: "You want cartoon romance, dance-floor side-eyes, and ecstatic oddball charm.",
      },
      {
        result: "afterglow",
        title: "The sincerity underneath it all.",
        detail: "Direct feeling, quiet devotion, and songs that stay close after they end.",
      },
    ],
  },
  {
    id: "takeaway",
    prompt: "By the end of the night, you want Friday to leave you...",
    options: [
      {
        result: "lift-off",
        title: "Still buzzing.",
        detail: "The chorus should keep echoing like the night is only getting started.",
      },
      {
        result: "twilight",
        title: "Dreamy and a little dazed.",
        detail: "You want glow, atmosphere, and a hint of longing around the edges.",
      },
      {
        result: "glitter",
        title: "Laughing at the perfect chaos.",
        detail: "Friday should leave a lipstick mark on the mirror and a story in your pocket.",
      },
      {
        result: "afterglow",
        title: "Held together by something gentle.",
        detail: "The best nights do not crash; they fade out warmly.",
      },
    ],
  },
];

function getFridayQuizResult(answers: Partial<Record<string, FridayQueueMood>>) {
  const scorecard: Record<FridayQueueMood, number> = {
    "lift-off": 0,
    twilight: 0,
    glitter: 0,
    afterglow: 0,
  };

  Object.values(answers).forEach((answer) => {
    if (answer) {
      scorecard[answer] += 1;
    }
  });

  return FRIDAY_QUIZ_RESULT_ORDER.reduce((bestMood, mood) =>
    scorecard[mood] > scorecard[bestMood] ? mood : bestMood,
  );
}

function getCoverMatchResult(answers: Partial<Record<string, CoverVersionId>>) {
  const scorecard: Record<CoverVersionId, number> = {
    "david-gray": 0,
    "himalaya-records": 0,
    "billy-rubin-trio": 0,
    nena: 0,
    "choir-choir-choir": 0,
  };

  Object.values(answers).forEach((answer) => {
    if (answer) {
      scorecard[answer] += 1;
    }
  });

  return COVER_VERSION_RESULT_ORDER.reduce((bestCover, coverId) =>
    scorecard[coverId] > scorecard[bestCover] ? coverId : bestCover,
  );
}

function getReleaseFormatResult(answers: Partial<Record<string, ReleaseFormatId>>) {
  const scorecard: Record<ReleaseFormatId, number> = {
    "seven-inch": 0,
    "twelve-inch": 0,
    "cd-single": 0,
  };

  Object.values(answers).forEach((answer) => {
    if (answer) {
      scorecard[answer] += 1;
    }
  });

  return RELEASE_FORMAT_RESULT_ORDER.reduce((bestFormat, formatId) =>
    scorecard[formatId] > scorecard[bestFormat] ? formatId : bestFormat,
  );
}

function buildTourContrastRows(currentSnapshot: LiveSetSnapshot, comparisonSnapshot: LiveSetSnapshot) {
  return currentSnapshot.setFeel.map((meter) => {
    const comparisonMeter: LiveSetFeelMeter =
      comparisonSnapshot.setFeel.find((item) => item.label === meter.label) ?? meter;
    const delta = meter.value - comparisonMeter.value;

    return {
      label: meter.label,
      currentValue: meter.value,
      comparisonValue: comparisonMeter.value,
      low: meter.low,
      high: meter.high,
      delta,
      note:
        delta === 0
          ? "This part of the live feel lands almost the same in both eras."
          : delta > 0
            ? `This era pushes harder toward ${meter.high.toLowerCase()}.`
            : `This era sits closer to ${meter.low.toLowerCase()}.`,
    };
  });
}

function getTourContrastSummary(
  currentSnapshot: LiveSetSnapshot,
  comparisonSnapshot: LiveSetSnapshot,
  rows: ReturnType<typeof buildTourContrastRows>,
) {
  if (currentSnapshot.id === comparisonSnapshot.id) {
    return `You are comparing ${currentSnapshot.label} with itself, so this board becomes a clean baseline for its own live balance.`;
  }

  const strongestShift = rows.reduce((strongest, row) =>
    Math.abs(row.delta) > Math.abs(strongest.delta) ? row : strongest,
  );

  if (strongestShift.delta === 0) {
    return `${currentSnapshot.label} and ${comparisonSnapshot.label} land with nearly the same balance across this set-feel board.`;
  }

  const directionCue = strongestShift.delta > 0 ? strongestShift.high.toLowerCase() : strongestShift.low.toLowerCase();
  const stepCount = Math.abs(strongestShift.delta);

  return `${currentSnapshot.label} pushes ${strongestShift.label.toLowerCase()} ${stepCount} step${stepCount === 1 ? "" : "s"} closer to ${directionCue} than ${comparisonSnapshot.label}.`;
}

function buildFridayFanFlyerText(
  queue: (typeof FRIDAY_CURE_QUEUES)[number],
  scene: VideoScene,
  snapshot: LiveSetSnapshot,
) {
  return [
    `Friday Fan Flyer`,
    `${queue.label} mood | ${scene.label} visual | ${snapshot.label} live cue`,
    "",
    `Start with ${queue.tracks[0].title} (${queue.tracks[0].era}) for ${queue.time.toLowerCase()}.`,
    `Visual cue: ${scene.scene}`,
    `Live cue: ${snapshot.crowdCue}`,
    `Keep reading: ${snapshot.href}`,
  ].join("\n");
}

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

const WeekdayForecastCard = () => {
  const prefersReducedMotion = useReducedMotion();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const activeForecast = now ? WEEKDAY_FORECASTS[now.getDay()] ?? DEFAULT_WEEKDAY_FORECAST : DEFAULT_WEEKDAY_FORECAST;
  const isExternalLink = activeForecast.cueHref.startsWith("http");

  return (
    <motion.aside
      className={styles.fridayForecast}
      data-day={activeForecast.dayLabel.toLowerCase()}
      aria-live="polite"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut", delay: 0.15 }}
    >
      <div className={styles.fridayForecastHeader}>
        <div>
          <p className={styles.fridayForecastEyebrow}>Friday Forecast</p>
          <h2 className={styles.fridayForecastTitle}>{activeForecast.headline}</h2>
        </div>

        <p className={styles.fridayForecastDay}>{activeForecast.dayLabel}</p>
      </div>

      <div className={styles.fridayForecastBody}>
        <p className={styles.fridayForecastWeather}>{activeForecast.weather}</p>
        <p className={styles.fridayForecastCopy}>{activeForecast.body}</p>
      </div>

      <div className={styles.fridayForecastFooter}>
        <p className={styles.fridayForecastPrompt}>Best next stop</p>
        <a
          href={activeForecast.cueHref}
          className={styles.fridayForecastLink}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
        >
          {activeForecast.cueLabel}
        </a>
      </div>
    </motion.aside>
  );
};

const SongSnapshotSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedFormatId, setSelectedFormatId] = useState<ReleaseFormatId>(RELEASE_FORMATS[0].id);
  const [selectedCompanionId, setSelectedCompanionId] = useState<SingleCompanionId>(SINGLE_COMPANIONS[0].id);
  const [formatAnswers, setFormatAnswers] = useState<Partial<Record<string, ReleaseFormatId>>>({});
  const selectedFormat = RELEASE_FORMATS.find((format) => format.id === selectedFormatId) ?? RELEASE_FORMATS[0];
  const answeredFormatQuestionCount = Object.keys(formatAnswers).length;
  const isFormatMatchComplete = answeredFormatQuestionCount === RELEASE_FORMAT_MATCH_QUESTIONS.length;
  const matchedFormatId = isFormatMatchComplete ? getReleaseFormatResult(formatAnswers) : null;
  const matchedFormat = matchedFormatId
    ? RELEASE_FORMATS.find((format) => format.id === matchedFormatId) ?? RELEASE_FORMATS[0]
    : null;
  const availableCompanions = SINGLE_COMPANIONS.filter((companion) => companion.formatIds.includes(selectedFormat.id));
  const selectedCompanion =
    availableCompanions.find((companion) => companion.id === selectedCompanionId) ?? availableCompanions[0];

  const handleFormatAnswerSelect = (questionId: string, result: ReleaseFormatId) => {
    const nextAnswers = {
      ...formatAnswers,
      [questionId]: result,
    };

    setFormatAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === RELEASE_FORMAT_MATCH_QUESTIONS.length) {
      setSelectedFormatId(getReleaseFormatResult(nextAnswers));
    }
  };

  return (
    <div className={styles.songSnapshotLayout}>
      <div className={styles.songInfo}>
        <div className={styles.songSnapshotFactsColumn}>
          <p className={styles.songSnapshotEyebrow}>Core details</p>
          <ul>
            {SONG_SNAPSHOT_FACTS.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.label}:</strong> {fact.value}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.songSnapshotStoryCard}>
          <p className={styles.songSnapshotEyebrow}>Release-day quirk</p>
          <h3 className={styles.songSnapshotStoryTitle}>A Friday single that really hit on a Friday.</h3>
          <p className={styles.songSnapshotStoryBody}>
            Part of the single&apos;s legend is that The Cure actually released some UK formats on a Friday,
            which was unusual enough to affect the song&apos;s first chart week before the full format rollout
            caught up.
          </p>

          <dl className={styles.songSnapshotStatGrid}>
            <div>
              <dt>UK peak</dt>
              <dd>#6</dd>
            </div>
            <div>
              <dt>US Alt</dt>
              <dd>#1</dd>
            </div>
            <div>
              <dt>B-sides</dt>
              <dd>Halo, Scared as You</dd>
            </div>
          </dl>
        </div>

        <div className={styles.songSnapshotCompanionCard} aria-labelledby="single-companion-board-title">
          <div className={styles.songSnapshotCompanionHeader}>
            <p className={styles.songSnapshotEyebrow}>Single Companion Board</p>
            <h3 id="single-companion-board-title" className={styles.songSnapshotCompanionTitle}>
              Hear what sits beside Friday on the {selectedFormat.format}.
            </h3>
            <p className={styles.songSnapshotCompanionIntro}>
              Switch formats below and this spotlight stays in sync, so you can see whether the single leans toward
              soft afterglow, darker tension, or the longer Strangelove glide.
            </p>
          </div>

          <div className={styles.songSnapshotCompanionLayout}>
            <div className={styles.songSnapshotCompanionList} role="tablist" aria-label="Single companion tracks">
              {availableCompanions.map((companion) => {
                const isSelected = selectedCompanion.id === companion.id;

                return (
                  <button
                    key={companion.id}
                    type="button"
                    role="tab"
                    id={`single-companion-tab-${companion.id}`}
                    aria-selected={isSelected}
                    aria-controls={`single-companion-panel-${companion.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`${styles.songSnapshotCompanionButton} ${
                      isSelected ? styles.songSnapshotCompanionButtonActive : ""
                    }`}
                    onClick={() => setSelectedCompanionId(companion.id)}
                  >
                    <span className={styles.songSnapshotCompanionButtonTitle}>{companion.title}</span>
                    <span className={styles.songSnapshotCompanionButtonTag}>{companion.tag}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.aside
                key={`${selectedFormat.id}-${selectedCompanion.id}`}
                id={`single-companion-panel-${selectedCompanion.id}`}
                role="tabpanel"
                aria-labelledby={`single-companion-tab-${selectedCompanion.id}`}
                className={styles.songSnapshotCompanionPanel}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              >
                <p className={styles.songSnapshotCompanionKicker}>{selectedCompanion.tag}</p>
                <h4 className={styles.songSnapshotCompanionPanelTitle}>{selectedCompanion.title}</h4>
                <p className={styles.songSnapshotCompanionHook}>{selectedCompanion.hook}</p>
                <p className={styles.songSnapshotCompanionBody}>{selectedCompanion.body}</p>

                <dl className={styles.songSnapshotCompanionFacts}>
                  <div>
                    <dt>Best for</dt>
                    <dd>{selectedCompanion.bestFor}</dd>
                  </div>
                  <div>
                    <dt>Current format cue</dt>
                    <dd>
                      {availableCompanions.length === 1
                        ? "This format keeps things lean with one companion route."
                        : `This format opens ${availableCompanions.length} companion routes around the single.`}
                    </dd>
                  </div>
                </dl>

                <div className={styles.songSnapshotCompanionFormats} aria-label="Formats carrying this companion track">
                  {RELEASE_FORMATS.map((format) => {
                    const isAvailable = selectedCompanion.formatIds.includes(format.id);
                    const isCurrentFormat = selectedFormat.id === format.id;

                    return (
                      <span
                        key={`${selectedCompanion.id}-${format.id}`}
                        className={`${styles.songSnapshotCompanionFormatChip} ${
                          isAvailable ? styles.songSnapshotCompanionFormatChipAvailable : ""
                        } ${isCurrentFormat ? styles.songSnapshotCompanionFormatChipCurrent : ""}`}
                      >
                        {format.tabLabel}
                      </span>
                    );
                  })}
                </div>

                <a
                  href={selectedCompanion.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.songSnapshotCompanionLink}
                >
                  {selectedCompanion.linkLabel}
                </a>
              </motion.aside>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className={styles.releaseFormatGuide}>
        <div className={styles.releaseFormatGuideHeader}>
          <div>
            <p className={styles.releaseFormatGuideEyebrow}>Release Format Guide</p>
            <h3 className={styles.releaseFormatGuideTitle}>Pick the 1992 version of Friday you want to hold onto.</h3>
          </div>

          <p className={styles.releaseFormatGuideIntro}>
            Same single, different fan textures: quick-hit vinyl, longer mix space, or the compact all-in-one CD route.
          </p>
        </div>

        <div className={styles.releaseFormatMatchmaker} aria-labelledby="release-format-matchmaker-title">
          <div className={styles.releaseFormatMatchmakerHeader}>
            <p className={styles.releaseFormatMatchmakerEyebrow}>Need a fast pick?</p>
            <h3 id="release-format-matchmaker-title" className={styles.releaseFormatMatchmakerTitle}>
              Release Format Matchmaker
            </h3>
            <p className={styles.releaseFormatMatchmakerIntro}>
              Answer three quick prompts and the guide below will jump to the format that best fits your Friday collector mood.
            </p>
          </div>

          <div className={styles.releaseFormatMatchmakerLayout}>
            <div className={styles.releaseFormatMatchmakerQuestions}>
              <p className={styles.releaseFormatMatchmakerProgress}>
                {answeredFormatQuestionCount === 0
                  ? "Pick the cues that sound most like your ideal copy of the single."
                  : `Answered ${answeredFormatQuestionCount} of ${RELEASE_FORMAT_MATCH_QUESTIONS.length} prompts.`}
              </p>

              {RELEASE_FORMAT_MATCH_QUESTIONS.map((question) => (
                <fieldset key={question.id} className={styles.releaseFormatMatchQuestionCard}>
                  <legend className={styles.releaseFormatMatchQuestionTitle}>{question.prompt}</legend>

                  <div className={styles.releaseFormatMatchOptionList}>
                    {question.options.map((option) => {
                      const isSelected = formatAnswers[question.id] === option.result;

                      return (
                        <button
                          key={`${question.id}-${option.result}`}
                          type="button"
                          className={`${styles.releaseFormatMatchOption} ${
                            isSelected ? styles.releaseFormatMatchOptionActive : ""
                          }`}
                          onClick={() => handleFormatAnswerSelect(question.id, option.result)}
                          aria-pressed={isSelected}
                        >
                          <span className={styles.releaseFormatMatchOptionTitle}>{option.title}</span>
                          <span className={styles.releaseFormatMatchOptionDetail}>{option.detail}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.aside
                key={matchedFormat?.id ?? "release-format-match-empty"}
                className={styles.releaseFormatMatchResult}
                aria-live="polite"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
              >
                {matchedFormat ? (
                  <>
                    <p className={styles.releaseFormatMatchResultKicker}>Your format cue</p>
                    <h4 className={styles.releaseFormatMatchResultTitle}>{matchedFormat.format}</h4>
                    <p className={styles.releaseFormatMatchResultMeta}>{matchedFormat.kicker}</p>
                    <p className={styles.releaseFormatMatchResultBody}>{matchedFormat.collectorNote}</p>
                    <p className={styles.releaseFormatMatchResultHint}>
                      The format guide below has already jumped to this pick, so you can stay here or compare it with the other versions.
                    </p>
                    <div className={styles.releaseFormatMatchResultActions}>
                      <a
                        href={matchedFormat.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.releaseFormatMatchResultLink}
                      >
                        {matchedFormat.linkLabel}
                      </a>
                      <button
                        type="button"
                        className={styles.releaseFormatMatchResetButton}
                        onClick={() => setFormatAnswers({})}
                      >
                        Reset prompts
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.releaseFormatMatchResultKicker}>Format waiting room</p>
                    <h4 className={styles.releaseFormatMatchResultTitle}>Your recommendation appears after the third pick.</h4>
                    <p className={styles.releaseFormatMatchResultBody}>
                      This quick matchmaker is for fans choosing between the classic single object, the longer mix lane, and the compact completionist route.
                    </p>
                  </>
                )}
              </motion.aside>
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.releaseFormatGuideShell}>
          <div className={styles.releaseFormatTabs} role="tablist" aria-label="Friday I'm in Love release formats">
            {RELEASE_FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                role="tab"
                id={`release-format-tab-${format.id}`}
                aria-selected={selectedFormat.id === format.id}
                aria-controls={`release-format-panel-${format.id}`}
                tabIndex={selectedFormat.id === format.id ? 0 : -1}
                className={`${styles.releaseFormatTab} ${
                  selectedFormat.id === format.id ? styles.releaseFormatTabActive : ""
                }`}
                onClick={() => setSelectedFormatId(format.id)}
              >
                <span className={styles.releaseFormatTabLabel}>{format.tabLabel}</span>
                <span className={styles.releaseFormatTabMeta}>{format.kicker}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={selectedFormat.id}
              id={`release-format-panel-${selectedFormat.id}`}
              role="tabpanel"
              aria-labelledby={`release-format-tab-${selectedFormat.id}`}
              className={styles.releaseFormatPanel}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
            >
              <div className={styles.releaseFormatPanelHeader}>
                <p className={styles.releaseFormatPanelKicker}>{selectedFormat.kicker}</p>
                <h4 className={styles.releaseFormatPanelTitle}>{selectedFormat.format}</h4>
                <p className={styles.releaseFormatPanelBody}>{selectedFormat.body}</p>
              </div>

              <ol className={styles.releaseFormatTrackList}>
                {selectedFormat.tracks.map((track, index) => (
                  <li key={`${selectedFormat.id}-${track.title}`} className={styles.releaseFormatTrackItem}>
                    <span className={styles.releaseFormatTrackNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.releaseFormatTrackCopy}>
                      <p className={styles.releaseFormatTrackTitle}>
                        {track.title}
                        <span>{track.length}</span>
                      </p>
                      <p className={styles.releaseFormatTrackNote}>{track.note}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className={styles.releaseFormatFooter}>
                <p className={styles.releaseFormatCollectorNote}>{selectedFormat.collectorNote}</p>
                <a
                  href={selectedFormat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.releaseFormatLink}
                >
                  {selectedFormat.linkLabel}
                </a>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ListenLoungeSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedLaneId, setSelectedLaneId] = useState<ListeningLaneId>("stream");
  const selectedLane = LISTENING_LANES.find((lane) => lane.id === selectedLaneId) ?? LISTENING_LANES[0];

  return (
    <section
      id="listen-friday"
      className={`${styles.spotifySection} ${styles.jumpTargetSection}`}
      aria-labelledby="listen-lounge-title"
    >
      <motion.h2
        id="listen-lounge-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Listen Lounge
      </motion.h2>

      <p className={styles.listenLoungeIntro}>
        Start with the studio single, the official video, or the live-history route and let the rest of the
        collage follow that version of Friday.
      </p>

      <div className={styles.listenLoungeShell}>
        <div className={styles.listenLoungeLaneGrid} role="group" aria-label="Choose a Friday I'm in Love listening lane">
          {LISTENING_LANES.map((lane) => {
            const isSelected = selectedLane.id === lane.id;

            return (
              <button
                key={lane.id}
                type="button"
                data-lane={lane.id}
                aria-pressed={isSelected}
                className={`${styles.listenLoungeLaneButton} ${
                  isSelected ? styles.listenLoungeLaneButtonActive : ""
                }`}
                onClick={() => setSelectedLaneId(lane.id)}
              >
                <span className={styles.listenLoungeLaneEyebrow}>{lane.eyebrow}</span>
                <span className={styles.listenLoungeLaneTitle}>{lane.label}</span>
                <span className={styles.listenLoungeLaneBody}>{lane.detail}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={selectedLane.id}
            className={styles.listenLoungePanel}
            data-lane={selectedLane.id}
            aria-live="polite"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
          >
            <div className={styles.listenLoungePanelHeader}>
              <p className={styles.listenLoungeKicker}>{selectedLane.eyebrow}</p>
              <h3 className={styles.listenLoungeHeadline}>{selectedLane.headline}</h3>
              <p className={styles.listenLoungeBody}>{selectedLane.body}</p>
            </div>

            {selectedLane.id === "stream" ? (
              <div className={styles.listenLoungeEmbedCard}>
                <div className={styles.spotifyEmbedWrapper}>
                  <iframe
                    title="Friday I'm in Love - Spotify Player"
                    src="https://open.spotify.com/embed/track/263aNAQCeFSWipk896byo6?utm_source=generator"
                    width="100%"
                    height="152"
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
                <p className={styles.listenLoungeDetail}>
                  <span>{selectedLane.detailLabel}</span>
                  {selectedLane.detail}
                </p>
              </div>
            ) : selectedLane.id === "video" ? (
              <div className={styles.listenLoungeMediaCard}>
                <div className={styles.listenLoungePalettePoster} aria-hidden="true">
                  {VIDEO_SCENES[0].palette.map((swatch) => (
                    <span key={swatch.name} style={{ backgroundColor: swatch.color }} />
                  ))}
                </div>
                <div className={styles.listenLoungeFactBlock}>
                  <p className={styles.listenLoungeFactLabel}>Visual cue</p>
                  <p className={styles.listenLoungeFactValue}>{VIDEO_SCENES[1].scene}</p>
                </div>
                <p className={styles.listenLoungeDetail}>
                  <span>{selectedLane.detailLabel}</span>
                  {selectedLane.detail}
                </p>
              </div>
            ) : (
              <div className={styles.listenLoungeMediaCard}>
                <div className={styles.listenLoungeFactGrid}>
                  <div className={styles.listenLoungeFactBlock}>
                    <p className={styles.listenLoungeFactLabel}>Live cue</p>
                    <p className={styles.listenLoungeFactValue}>{LIVE_SET_SNAPSHOTS[3].crowdCue}</p>
                  </div>
                  <div className={styles.listenLoungeFactBlock}>
                    <p className={styles.listenLoungeFactLabel}>Good follow-up</p>
                    <p className={styles.listenLoungeFactValue}>{LIVE_SET_SNAPSHOTS[2].tracks[2].title}</p>
                  </div>
                </div>
                <p className={styles.listenLoungeDetail}>
                  <span>{selectedLane.detailLabel}</span>
                  {selectedLane.detail}
                </p>
              </div>
            )}

            <div className={styles.listenLoungeActionRow}>
              <a
                href={selectedLane.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.listenLoungeActionLink}
              >
                {selectedLane.linkLabel}
              </a>
              <a
                href="https://www.thecure.com/release/friday-im-in-love/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.listenLoungeActionLink}
              >
                Official release page
              </a>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
};

const FridayMixtapeNavigator = () => {
  const [activeSectionId, setActiveSectionId] = useState(QUICK_JUMP_LINKS[0].id);
  const activeLink = QUICK_JUMP_LINKS.find((link) => link.id === activeSectionId) ?? QUICK_JUMP_LINKS[0];

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = QUICK_JUMP_LINKS.map((link) => document.getElementById(link.id)).filter(
      (section): section is HTMLElement => section !== null,
    );

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        if (visibleEntries[0]) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.mixtapeNavigatorSection} aria-labelledby="mixtape-navigator-title">
      <div className={styles.mixtapeNavigatorShell}>
        <div className={styles.mixtapeNavigatorHeader}>
          <div>
            <p className={styles.mixtapeNavigatorEyebrow}>Quick Jump Mixtape</p>
            <h2 id="mixtape-navigator-title" className={styles.mixtapeNavigatorTitle}>
              Skip to the Friday mood you want.
            </h2>
          </div>

          <p className={styles.mixtapeNavigatorIntro}>
            This page runs like a long fan collage, so these track buttons keep the singalong moving.
          </p>
        </div>

        <nav aria-label="Quick jump across Friday I&apos;m in Love sections">
          <ul className={styles.mixtapeNavigatorList}>
            {QUICK_JUMP_LINKS.map((link) => {
              const isActive = link.id === activeLink.id;

              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`${styles.mixtapeNavigatorLink} ${isActive ? styles.mixtapeNavigatorLinkActive : ""}`}
                    aria-current={isActive ? "location" : undefined}
                  >
                    <span className={styles.mixtapeNavigatorTrack}>{link.track}</span>
                    <span className={styles.mixtapeNavigatorLabel}>{link.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.mixtapeNavigatorNowPlaying}>
          <p className={styles.mixtapeNavigatorNowPlayingLabel}>Now spotlighting</p>
          <p className={styles.mixtapeNavigatorNowPlayingTitle}>
            {activeLink.track} · {activeLink.title}
          </p>
          <p className={styles.mixtapeNavigatorNowPlayingBody}>{activeLink.note}</p>
        </div>
      </div>
    </section>
  );
};

const FridayQueueSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedMood, setSelectedMood] = useState<FridayQueueMood>("lift-off");
  const selectedQueue = FRIDAY_CURE_QUEUES.find((queue) => queue.mood === selectedMood) ?? FRIDAY_CURE_QUEUES[0];

  return (
    <section
      id="friday-cure-queue"
      className={`${styles.fridayQueueSection} ${styles.jumpTargetSection}`}
      aria-labelledby="friday-queue-title"
    >
      <motion.h2
        id="friday-queue-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Build Your Friday Cure Queue
      </motion.h2>

      <p className={styles.queueIntro}>
        Pick the flavor of Friday you want after the title track and get a quick three-song route deeper
        into The Cure.
      </p>

      <div className={styles.queueShell}>
        <div className={styles.queueTabs} role="tablist" aria-label="Friday Cure queue moods">
          {FRIDAY_CURE_QUEUES.map((queue) => (
            <button
              key={queue.mood}
              type="button"
              role="tab"
              id={`queue-tab-${queue.mood}`}
              aria-selected={selectedMood === queue.mood}
              aria-controls={`queue-panel-${queue.mood}`}
              data-mood={queue.mood}
              className={`${styles.queueTabButton} ${
                selectedMood === queue.mood ? styles.queueTabButtonActive : ""
              }`}
              onClick={() => setSelectedMood(queue.mood)}
            >
              <span className={styles.queueTabLabel}>{queue.label}</span>
              <span className={styles.queueTabTime}>{queue.time}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={selectedQueue.mood}
            id={`queue-panel-${selectedQueue.mood}`}
            role="tabpanel"
            aria-labelledby={`queue-tab-${selectedQueue.mood}`}
            className={styles.queuePanel}
            data-mood={selectedQueue.mood}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
          >
            <div className={styles.queuePanelHeader}>
              <p className={styles.queuePanelKicker}>{selectedQueue.kicker}</p>
              <h3 className={styles.queuePanelHeadline}>{selectedQueue.headline}</h3>
              <p className={styles.queuePanelDescription}>{selectedQueue.description}</p>
            </div>

            <ol className={styles.queueTrackList}>
              {selectedQueue.tracks.map((track, index) => (
                <li key={track.title} className={styles.queueTrackItem}>
                  <span className={styles.queueTrackNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.queueTrackCopy}>
                    <p className={styles.queueTrackHeading}>
                      {track.title}
                      <span>{track.era}</span>
                    </p>
                    <p className={styles.queueTrackNote}>{track.note}</p>
                  </div>
                  <a
                    href={track.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.queueTrackLink}
                  >
                    Search on Spotify
                  </a>
                </li>
              ))}
            </ol>
          </motion.section>
        </AnimatePresence>
      </div>
    </section>
  );
};

const FridayFanFlyerSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedMood, setSelectedMood] = useState<FridayQueueMood>(FRIDAY_CURE_QUEUES[0].mood);
  const [selectedSceneId, setSelectedSceneId] = useState<VideoSceneId>(VIDEO_SCENES[0].id);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<LiveSetSnapshotId>(LIVE_SET_SNAPSHOTS[0].id);
  const [copyStatus, setCopyStatus] = useState("Copy the flyer text for later.");

  const selectedQueue = FRIDAY_CURE_QUEUES.find((queue) => queue.mood === selectedMood) ?? FRIDAY_CURE_QUEUES[0];
  const selectedScene = VIDEO_SCENES.find((scene) => scene.id === selectedSceneId) ?? VIDEO_SCENES[0];
  const selectedSnapshot =
    LIVE_SET_SNAPSHOTS.find((snapshot) => snapshot.id === selectedSnapshotId) ?? LIVE_SET_SNAPSHOTS[0];

  const flyerText = buildFridayFanFlyerText(selectedQueue, selectedScene, selectedSnapshot);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(flyerText);
      setCopyStatus("Flyer text copied.");
    } catch {
      setCopyStatus("Copy did not work here, but the flyer links are still ready below.");
    }
  };

  return (
    <section
      id="friday-fan-flyer"
      className={`${styles.fanFlyerSection} ${styles.jumpTargetSection}`}
      aria-labelledby="fan-flyer-title"
    >
      <motion.h2
        id="fan-flyer-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Friday Fan Flyer
      </motion.h2>

      <p className={styles.fanFlyerIntro}>
        Build a one-card Cure night plan by mixing a listening mood, a video color story, and a live-era glow.
      </p>

      <div className={styles.fanFlyerLayout}>
        <div className={styles.fanFlyerControls}>
          <fieldset className={styles.fanFlyerFieldset}>
            <legend className={styles.fanFlyerLegend}>1. Pick the Friday mood</legend>
            <div className={styles.fanFlyerOptionGrid}>
              {FRIDAY_CURE_QUEUES.map((queue) => {
                const isSelected = selectedQueue.mood === queue.mood;

                return (
                  <button
                    key={queue.mood}
                    type="button"
                    className={`${styles.fanFlyerOption} ${isSelected ? styles.fanFlyerOptionActive : ""}`}
                    onClick={() => setSelectedMood(queue.mood)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.fanFlyerOptionTitle}>{queue.label}</span>
                    <span className={styles.fanFlyerOptionMeta}>{queue.time}</span>
                    <span className={styles.fanFlyerOptionBody}>{queue.kicker}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className={styles.fanFlyerFieldset}>
            <legend className={styles.fanFlyerLegend}>2. Choose a video texture</legend>
            <div className={styles.fanFlyerOptionGrid}>
              {VIDEO_SCENES.map((scene) => {
                const isSelected = selectedScene.id === scene.id;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    className={`${styles.fanFlyerOption} ${isSelected ? styles.fanFlyerOptionActive : ""}`}
                    onClick={() => setSelectedSceneId(scene.id)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.fanFlyerOptionTitle}>{scene.label}</span>
                    <span className={styles.fanFlyerOptionMeta}>{scene.kicker}</span>
                    <span className={styles.fanFlyerOptionBody}>{scene.scene}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className={styles.fanFlyerFieldset}>
            <legend className={styles.fanFlyerLegend}>3. Land in a live-era frame</legend>
            <div className={styles.fanFlyerOptionGrid}>
              {LIVE_SET_SNAPSHOTS.map((snapshot) => {
                const isSelected = selectedSnapshot.id === snapshot.id;

                return (
                  <button
                    key={snapshot.id}
                    type="button"
                    className={`${styles.fanFlyerOption} ${isSelected ? styles.fanFlyerOptionActive : ""}`}
                    onClick={() => setSelectedSnapshotId(snapshot.id)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.fanFlyerOptionTitle}>{snapshot.label}</span>
                    <span className={styles.fanFlyerOptionMeta}>{snapshot.years}</span>
                    <span className={styles.fanFlyerOptionBody}>{snapshot.kicker}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.aside
            key={`${selectedQueue.mood}-${selectedScene.id}-${selectedSnapshot.id}`}
            className={styles.fanFlyerPreview}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18, rotate: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
          >
            <p className={styles.fanFlyerPreviewEyebrow}>Custom Friday route</p>

            <div className={styles.fanFlyerStickerRow} aria-label="Selected Friday flyer cues">
              <span className={styles.fanFlyerSticker}>{selectedQueue.time}</span>
              <span className={styles.fanFlyerSticker}>{selectedScene.label}</span>
              <span className={styles.fanFlyerSticker}>{selectedSnapshot.years}</span>
            </div>

            <h3 className={styles.fanFlyerTitle}>
              {selectedQueue.label} hearts, {selectedScene.label} colors, {selectedSnapshot.label} energy.
            </h3>

            <p className={styles.fanFlyerBody}>
              Start with <strong>{selectedQueue.tracks[0].title}</strong> to set a {selectedQueue.time.toLowerCase()} tone,
              keep the room inside {selectedScene.scene.toLowerCase()}, and imagine the {selectedSnapshot.years} crowd
              response when the chorus arrives.
            </p>

            <ol className={styles.fanFlyerChecklist}>
              <li className={styles.fanFlyerStep}>
                <span className={styles.fanFlyerStepLabel}>Spin</span>
                <span className={styles.fanFlyerStepText}>{selectedQueue.tracks[0].note}</span>
              </li>
              <li className={styles.fanFlyerStep}>
                <span className={styles.fanFlyerStepLabel}>See</span>
                <span className={styles.fanFlyerStepText}>{selectedScene.whyItWorks}</span>
              </li>
              <li className={styles.fanFlyerStep}>
                <span className={styles.fanFlyerStepLabel}>Imagine</span>
                <span className={styles.fanFlyerStepText}>{selectedSnapshot.crowdCue}</span>
              </li>
            </ol>

            <div className={styles.fanFlyerActions}>
              <a
                href={selectedQueue.tracks[0].link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fanFlyerActionLink}
              >
                Search {selectedQueue.tracks[0].title}
              </a>
              <a
                href={OFFICIAL_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fanFlyerActionLink}
              >
                Open official video
              </a>
              <a
                href={selectedSnapshot.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fanFlyerActionLink}
              >
                Read live reference
              </a>
            </div>

            <div className={styles.fanFlyerFooter}>
              <button type="button" className={styles.fanFlyerCopyButton} onClick={handleCopy}>
                Copy flyer text
              </button>
              <p className={styles.fanFlyerCopyStatus} aria-live="polite">
                {copyStatus}
              </p>
            </div>
          </motion.aside>
        </AnimatePresence>
      </div>
    </section>
  );
};

const FridayQueueQuizSection = () => {
  const [answers, setAnswers] = useState<Partial<Record<string, FridayQueueMood>>>({});
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === FRIDAY_QUIZ_QUESTIONS.length;
  const resultMood = isComplete ? getFridayQuizResult(answers) : null;
  const resultQueue = resultMood
    ? FRIDAY_CURE_QUEUES.find((queue) => queue.mood === resultMood) ?? FRIDAY_CURE_QUEUES[0]
    : null;

  return (
    <section id="friday-quiz" className={`${styles.fridayQuizSection} ${styles.jumpTargetSection}`} aria-labelledby="friday-quiz-title">
      <motion.h2
        id="friday-quiz-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Which Friday Cure Queue Are You?
      </motion.h2>

      <p className={styles.quizIntro}>
        Answer four quick mood-board questions and get the Cure listening route that best matches your
        version of Friday night.
      </p>

      <div className={styles.quizBoard}>
        <div className={styles.quizQuestions}>
          <p className={styles.quizProgress}>
            {answeredCount === 0
              ? "Start anywhere. Your Friday queue appears after the fourth answer."
              : `Answered ${answeredCount} of ${FRIDAY_QUIZ_QUESTIONS.length} questions.`}
          </p>

          {FRIDAY_QUIZ_QUESTIONS.map((question) => (
            <fieldset key={question.id} className={styles.quizQuestionCard}>
              <legend className={styles.quizLegend}>{question.prompt}</legend>

              <div className={styles.quizOptionList}>
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.result;

                  return (
                    <label
                      key={`${question.id}-${option.result}`}
                      className={styles.quizOptionLabel}
                      data-selected={isSelected}
                      data-result={option.result}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        className={styles.quizOptionInput}
                        checked={isSelected}
                        onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.result }))}
                      />
                      <span className={styles.quizOptionCard}>
                        <span className={styles.quizOptionTitle}>{option.title}</span>
                        <span className={styles.quizOptionDetail}>{option.detail}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className={styles.quizResultColumn}>
          {resultQueue ? (
            <aside className={styles.quizResultCard} data-result={resultQueue.mood} aria-live="polite">
              <p className={styles.quizResultKicker}>Collage Result</p>
              <h3 className={styles.quizResultTitle}>{resultQueue.label} Friday</h3>
              <p className={styles.quizResultBody}>
                {resultQueue.headline} {resultQueue.description}
              </p>

              <dl className={styles.quizResultStats}>
                <div>
                  <dt>Best First Spin</dt>
                  <dd>{resultQueue.tracks[0].title}</dd>
                </div>
                <div>
                  <dt>Best Time</dt>
                  <dd>{resultQueue.time}</dd>
                </div>
              </dl>

              <div className={styles.quizResultLinks}>
                <a href="#friday-cure-queue" className={styles.quizResultLink}>
                  Jump to Queue
                </a>
                <a
                  href={resultQueue.tracks[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.quizResultLink}
                >
                  Search {resultQueue.tracks[0].title}
                </a>
              </div>

              <button type="button" className={styles.quizResetButton} onClick={() => setAnswers({})}>
                Reset Quiz
              </button>
            </aside>
          ) : (
            <aside className={styles.quizResultEmpty} aria-live="polite">
              <p className={styles.quizResultEmptyKicker}>Collage Result</p>
              <h3 className={styles.quizResultEmptyTitle}>Your Friday route is waiting.</h3>
              <p className={styles.quizResultEmptyBody}>
                Finish all four questions and this board will match you with the Cure queue that fits your
                Friday energy right now.
              </p>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};

const NewsTicker = () => {
  const prefersReducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  const activeItem = NEWS_ITEMS[current];
  const reducedMotionEnabled = prefersReducedMotion === true;
  const isPaused = reducedMotionEnabled || isManuallyPaused;
  const isAutoplayActive = !reducedMotionEnabled && !isPaused;

  useEffect(() => {
    if (!isAutoplayActive) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isAutoplayActive]);

  const handlePrevious = () => {
    setCurrent((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % NEWS_ITEMS.length);
  };

  return (
    <section id="cure-news-reel" className={`${styles.newsTickerSection} ${styles.jumpTargetSection}`} aria-labelledby="news-reel-title">
      <div className={styles.newsTickerWrapper}>
        <div className={styles.newsTickerHeader}>
          <div>
            <p className={styles.newsTickerLabel}>Cure News Reel</p>
            <h2 id="news-reel-title" className={styles.newsTickerTitle}>
              Fresh headlines, with your own tempo.
            </h2>
          </div>

          <p className={styles.newsTickerStatus}>
            {prefersReducedMotion
              ? "Reduced motion keeps autoplay off."
              : isPaused
                ? "Paused for manual browsing."
                : "Auto-rotating every five seconds."}
          </p>
        </div>

        <div className={styles.newsTickerStage}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeItem.date}
              className={styles.newsTickerCard}
              aria-live={isAutoplayActive ? "off" : "polite"}
              initial={reducedMotionEnabled ? { opacity: 1 } : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotionEnabled ? { opacity: 1 } : { opacity: 0, x: -28 }}
              transition={reducedMotionEnabled ? { duration: 0 } : { duration: 0.32, ease: "easeOut" }}
            >
              <div className={styles.newsTickerMeta}>
                <span className={styles.newsTickerDate}>{activeItem.date}</span>
                <span className={styles.newsTickerSource}>{activeItem.source}</span>
              </div>

              <p className={styles.newsTickerText}>{activeItem.text}</p>

              <a
                href={activeItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsTickerItem}
              >
                Read source
                <span className={styles.newsTickerArrow}>→</span>
              </a>
            </motion.article>
          </AnimatePresence>

          <div className={styles.newsTickerControls} aria-label="News reel controls">
            <button type="button" className={styles.newsTickerControlButton} onClick={handlePrevious}>
              Previous
            </button>
            <button
              type="button"
              className={styles.newsTickerControlButton}
              onClick={() => setIsManuallyPaused((paused) => !paused)}
              disabled={reducedMotionEnabled}
              aria-pressed={isManuallyPaused}
            >
              {reducedMotionEnabled ? "Motion Off" : isManuallyPaused ? "Resume" : "Pause"}
            </button>
            <button type="button" className={styles.newsTickerControlButton} onClick={handleNext}>
              Next
            </button>
          </div>
        </div>

        <div className={styles.newsTickerMarkers} aria-label="Choose a headline">
          {NEWS_ITEMS.map((item, index) => (
            <button
              key={item.date}
              type="button"
              className={`${styles.newsTickerMarker} ${index === current ? styles.newsTickerMarkerActive : ""}`}
              onClick={() => setCurrent(index)}
              aria-label={`Show headline ${index + 1}: ${item.text}`}
              aria-pressed={index === current}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.source}</span>
            </button>
          ))}
        </div>
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
    <section id="guitar-tabs" className={`${styles.chordTabsSection} ${styles.jumpTargetSection}`}>
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
  <section id="music-theory" className={`${styles.infoSection} ${styles.jumpTargetSection}`} aria-labelledby="music-theory-title">
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
    <section
      id="behind-the-scenes"
      className={`${styles.infoSection} ${styles.jumpTargetSection}`}
      aria-labelledby="behind-the-scenes-title"
    >
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

const VideoSceneDecoderSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedSceneId, setSelectedSceneId] = useState<VideoSceneId>(VIDEO_SCENES[0].id);
  const selectedScene = VIDEO_SCENES.find((scene) => scene.id === selectedSceneId) ?? VIDEO_SCENES[0];

  return (
    <section
      id="video-scene-decoder"
      className={`${styles.videoDecoderSection} ${styles.jumpTargetSection}`}
      aria-labelledby="video-decoder-title"
    >
      <motion.h2
        id="video-decoder-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Video Scene Decoder
      </motion.h2>

      <p className={styles.videoDecoderIntro}>
        The Tim Pope clip turns the single into bright collage chaos. Pick a visual lane and see how the
        video keeps the song playful, romantic, and unmistakably Cure.
      </p>

      <div className={styles.videoDecoderShell}>
        <div className={styles.videoDecoderTabs} role="tablist" aria-label="Friday I'm in Love video scenes">
          {VIDEO_SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              role="tab"
              id={`video-scene-tab-${scene.id}`}
              aria-selected={selectedScene.id === scene.id}
              aria-controls={`video-scene-panel-${scene.id}`}
              tabIndex={selectedScene.id === scene.id ? 0 : -1}
              className={`${styles.videoDecoderTab} ${
                selectedScene.id === scene.id ? styles.videoDecoderTabActive : ""
              }`}
              onClick={() => setSelectedSceneId(scene.id)}
            >
              <span className={styles.videoDecoderTabLabel}>{scene.label}</span>
              <span className={styles.videoDecoderTabScene}>{scene.scene}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={selectedScene.id}
            id={`video-scene-panel-${selectedScene.id}`}
            role="tabpanel"
            aria-labelledby={`video-scene-tab-${selectedScene.id}`}
            className={styles.videoDecoderPanel}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
          >
            <div className={styles.videoDecoderPanelHeader}>
              <p className={styles.videoDecoderKicker}>{selectedScene.kicker}</p>
              <h3 className={styles.videoDecoderHeadline}>{selectedScene.headline}</h3>
              <p className={styles.videoDecoderSceneDetail}>{selectedScene.scene}</p>
            </div>

            <p className={styles.videoDecoderBody}>{selectedScene.body}</p>

            <dl className={styles.videoDecoderFacts}>
              <div>
                <dt>Why it lands</dt>
                <dd>{selectedScene.whyItWorks}</dd>
              </div>
              <div>
                <dt>Fan mood</dt>
                <dd>{selectedScene.fanMood}</dd>
              </div>
            </dl>

            <div className={styles.videoDecoderPaletteBlock}>
              <p className={styles.videoDecoderPaletteLabel}>Palette cue</p>
              <ul className={styles.videoDecoderPaletteList}>
                {selectedScene.palette.map((swatch) => (
                  <li key={swatch.name} className={styles.videoDecoderPaletteItem}>
                    <span
                      className={styles.videoDecoderSwatch}
                      style={{ backgroundColor: swatch.color }}
                      aria-hidden="true"
                    />
                    <span>{swatch.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={OFFICIAL_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.videoDecoderLink}
            >
              Revisit the official video
            </a>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
};

const TourLiveMomentsSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<LiveSetSnapshotId>(LIVE_SET_SNAPSHOTS[0].id);
  const [comparisonSnapshotId, setComparisonSnapshotId] = useState<LiveSetSnapshotId>(
    LIVE_SET_SNAPSHOTS[LIVE_SET_SNAPSHOTS.length - 1].id,
  );
  const selectedSnapshot = LIVE_SET_SNAPSHOTS.find((snapshot) => snapshot.id === selectedSnapshotId) ?? LIVE_SET_SNAPSHOTS[0];
  const comparisonSnapshot =
    LIVE_SET_SNAPSHOTS.find((snapshot) => snapshot.id === comparisonSnapshotId) ?? LIVE_SET_SNAPSHOTS[LIVE_SET_SNAPSHOTS.length - 1];
  const selectedTourMoment =
    TOUR_LIVE_MOMENTS.find((moment) => moment.snapshotId === selectedSnapshot.id) ?? TOUR_LIVE_MOMENTS[0];
  const tourContrastRows = buildTourContrastRows(selectedSnapshot, comparisonSnapshot);
  const tourContrastSummary = getTourContrastSummary(selectedSnapshot, comparisonSnapshot, tourContrastRows);

  return (
    <section id="tour-live-moments" className={`${styles.infoSection} ${styles.jumpTargetSection}`} aria-labelledby="tour-live-title">
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
        An interactive timeline of how &quot;Friday I&apos;m in Love&quot; became one of The Cure&apos;s most
        beloved live singalong moments.
      </p>

      <div className={styles.tourLiveLayout}>
        <div className={styles.tourTrajectoryBoard}>
          <div className={styles.tourTrajectoryHeader}>
            <p className={styles.tourTrajectoryEyebrow}>Live Glow Timeline</p>
            <h3 className={styles.tourTrajectoryTitle}>Trace how the song changes shape on stage.</h3>
            <p className={styles.tourTrajectoryIntro}>
              Select an era stop to follow the live story from Wish-era lift-off to present-day warmth. The
              live set snapshot on the right updates with it.
            </p>
          </div>

          <ul className={styles.tourTrajectoryRail} aria-label="Friday I'm in Love live era timeline">
            {TOUR_LIVE_MOMENTS.map((item) => {
              const isSelected = item.snapshotId === selectedSnapshot.id;

              return (
                <li key={item.snapshotId}>
                  <button
                    type="button"
                    className={`${styles.tourTrajectoryStep} ${isSelected ? styles.tourTrajectoryStepActive : ""}`}
                    onClick={() => setSelectedSnapshotId(item.snapshotId)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.tourTrajectoryStepDot} aria-hidden="true" />
                    <span className={styles.tourTrajectoryStepYear}>{item.year}</span>
                    <span className={styles.tourTrajectoryStepCopy}>
                      <span className={styles.tourTrajectoryStepTitle}>{item.title}</span>
                      <span className={styles.tourTrajectoryStepSetting}>{item.setting}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={selectedTourMoment.snapshotId}
              className={styles.tourTrajectoryDetail}
              aria-live="polite"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
            >
              <p className={styles.tourTrajectoryDetailEyebrow}>
                {selectedTourMoment.year} · {selectedSnapshot.label}
              </p>
              <h4 className={styles.tourTrajectoryDetailTitle}>{selectedTourMoment.title}</h4>
              <p className={styles.tourTrajectoryDetailBody}>{selectedTourMoment.detail}</p>

              <dl className={styles.tourTrajectoryFacts}>
                <div>
                  <dt>Best setting</dt>
                  <dd>{selectedTourMoment.setting}</dd>
                </div>
                <div>
                  <dt>Fan cue</dt>
                  <dd>{selectedTourMoment.fanCue}</dd>
                </div>
              </dl>

              <a
                href={selectedTourMoment.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tourTrajectoryDetailLink}
              >
                Source: {selectedTourMoment.source}
              </a>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.tourSnapshotShell}>
          <div className={styles.tourSnapshotIntro}>
            <p className={styles.tourSnapshotEyebrow}>Live Set Snapshot</p>
            <p className={styles.tourSnapshotHint}>
              Pick an era to see a fan-friendly sketch of how the song tends to hit inside different Cure live flows.
            </p>
          </div>

          <div className={styles.tourSnapshotTabs} role="tablist" aria-label="Friday I'm in Love live set snapshots">
            {LIVE_SET_SNAPSHOTS.map((snapshot) => (
              <button
                key={snapshot.id}
                type="button"
                role="tab"
                id={`tour-snapshot-tab-${snapshot.id}`}
                aria-selected={selectedSnapshot.id === snapshot.id}
                aria-controls={`tour-snapshot-panel-${snapshot.id}`}
                tabIndex={selectedSnapshot.id === snapshot.id ? 0 : -1}
                className={`${styles.tourSnapshotTab} ${
                  selectedSnapshot.id === snapshot.id ? styles.tourSnapshotTabActive : ""
                }`}
                onClick={() => setSelectedSnapshotId(snapshot.id)}
              >
                <span className={styles.tourSnapshotTabLabel}>{snapshot.label}</span>
                <span className={styles.tourSnapshotTabYears}>{snapshot.years}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={selectedSnapshot.id}
              id={`tour-snapshot-panel-${selectedSnapshot.id}`}
              role="tabpanel"
              aria-labelledby={`tour-snapshot-tab-${selectedSnapshot.id}`}
              className={styles.tourSnapshotPanel}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
            >
              <div className={styles.tourSnapshotPanelHeader}>
                <p className={styles.tourSnapshotPanelKicker}>{selectedSnapshot.kicker}</p>
                <h3 className={styles.tourSnapshotPanelTitle}>{selectedSnapshot.headline}</h3>
                <p className={styles.tourSnapshotPanelYears}>{selectedSnapshot.years}</p>
              </div>

              <p className={styles.tourSnapshotBody}>{selectedSnapshot.body}</p>

              <div className={styles.tourSnapshotFactCard}>
                <p className={styles.tourSnapshotFactLabel}>Crowd cue</p>
                <p className={styles.tourSnapshotFactValue}>{selectedSnapshot.crowdCue}</p>
              </div>

              <section className={styles.tourSnapshotMeterBoard} aria-labelledby="tour-snapshot-meter-title">
                <div className={styles.tourSnapshotMeterHeader}>
                  <p id="tour-snapshot-meter-title" className={styles.tourSnapshotMeterTitle}>
                    Set feel board
                  </p>
                  <p className={styles.tourSnapshotMeterIntro}>
                    A quick read on how this era frames the song once it hits the set.
                  </p>
                </div>

                <ul className={styles.tourSnapshotMeterList}>
                  {selectedSnapshot.setFeel.map((meter) => (
                    <li key={`${selectedSnapshot.id}-${meter.label}`} className={styles.tourSnapshotMeterItem}>
                      <div className={styles.tourSnapshotMeterMeta}>
                        <span className={styles.tourSnapshotMeterName}>{meter.label}</span>
                        <span className={styles.tourSnapshotMeterValue}>{meter.value}/5</span>
                      </div>
                      <div
                        className={styles.tourSnapshotMeterTrack}
                        role="meter"
                        aria-valuemin={1}
                        aria-valuemax={5}
                        aria-valuenow={meter.value}
                        aria-label={`${meter.label}: ${meter.value} out of 5`}
                      >
                        <span
                          className={styles.tourSnapshotMeterFill}
                          style={{ width: `${(meter.value / 5) * 100}%` }}
                        />
                      </div>
                      <div className={styles.tourSnapshotMeterScale} aria-hidden="true">
                        <span>{meter.low}</span>
                        <span>{meter.high}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.tourContrastBoard} aria-labelledby="tour-contrast-board-title">
                <div className={styles.tourContrastHeader}>
                  <p className={styles.tourContrastEyebrow}>Era Contrast Board</p>
                  <h4 id="tour-contrast-board-title" className={styles.tourContrastTitle}>
                    Compare this live stop with another Cure era.
                  </h4>
                  <p className={styles.tourContrastIntro}>
                    Keep the current snapshot on top, then pick a second era to see where the live feel turns brighter,
                    harder, or more tender.
                  </p>
                </div>

                <div className={styles.tourContrastPicker} role="group" aria-label="Choose a live era to compare against">
                  {LIVE_SET_SNAPSHOTS.map((snapshot) => {
                    const isSelected = snapshot.id === comparisonSnapshot.id;

                    return (
                      <button
                        key={`tour-contrast-${snapshot.id}`}
                        type="button"
                        className={`${styles.tourContrastButton} ${isSelected ? styles.tourContrastButtonActive : ""}`}
                        onClick={() => setComparisonSnapshotId(snapshot.id)}
                        aria-pressed={isSelected}
                      >
                        <span className={styles.tourContrastButtonLabel}>{snapshot.label}</span>
                        <span className={styles.tourContrastButtonMeta}>{snapshot.years}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.tourContrastSummary}>
                  <p className={styles.tourContrastSummaryLabel}>
                    {selectedSnapshot.label} vs {comparisonSnapshot.label}
                  </p>
                  <p className={styles.tourContrastSummaryBody}>{tourContrastSummary}</p>
                </div>

                <ul className={styles.tourContrastList}>
                  {tourContrastRows.map((row) => {
                    const deltaLabel = row.delta > 0 ? `+${row.delta}` : `${row.delta}`;
                    const deltaDirection = row.delta > 0 ? "up" : row.delta < 0 ? "down" : "even";

                    return (
                      <li key={`${selectedSnapshot.id}-${comparisonSnapshot.id}-${row.label}`} className={styles.tourContrastItem}>
                        <div className={styles.tourContrastItemHeader}>
                          <p className={styles.tourContrastMetric}>{row.label}</p>
                          <span className={styles.tourContrastDelta} data-direction={deltaDirection}>
                            {deltaLabel}
                          </span>
                        </div>

                        <div className={styles.tourContrastValueRow}>
                          <span>{selectedSnapshot.label}</span>
                          <span>{row.currentValue}/5</span>
                        </div>
                        <div className={styles.tourContrastTrack} aria-hidden="true">
                          <span className={styles.tourContrastFill} style={{ width: `${(row.currentValue / 5) * 100}%` }} />
                        </div>

                        <div className={styles.tourContrastValueRow}>
                          <span>{comparisonSnapshot.label}</span>
                          <span>{row.comparisonValue}/5</span>
                        </div>
                        <div className={`${styles.tourContrastTrack} ${styles.tourContrastTrackComparison}`} aria-hidden="true">
                          <span
                            className={`${styles.tourContrastFill} ${styles.tourContrastFillComparison}`}
                            style={{ width: `${(row.comparisonValue / 5) * 100}%` }}
                          />
                        </div>

                        <p className={styles.tourContrastNote}>{row.note}</p>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <ol className={styles.tourSnapshotTrackList}>
                {selectedSnapshot.tracks.map((track) => (
                  <li key={`${selectedSnapshot.id}-${track.slot}-${track.title}`} className={styles.tourSnapshotTrackItem}>
                    <span className={styles.tourSnapshotTrackSlot}>{track.slot}</span>
                    <div className={styles.tourSnapshotTrackCopy}>
                      <p className={styles.tourSnapshotTrackTitle}>{track.title}</p>
                      <p className={styles.tourSnapshotTrackNote}>{track.note}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <a
                href={selectedSnapshot.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tourSnapshotLink}
              >
                Source: {selectedSnapshot.source}
              </a>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const CoverVersionsSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCoverId, setSelectedCoverId] = useState<CoverVersionId>(COVER_VERSIONS[0].id);
  const [coverAnswers, setCoverAnswers] = useState<Partial<Record<string, CoverVersionId>>>({});
  const coverAnsweredCount = Object.keys(coverAnswers).length;
  const isCoverMatchComplete = coverAnsweredCount === COVER_MATCH_QUESTIONS.length;
  const matchedCoverId = isCoverMatchComplete ? getCoverMatchResult(coverAnswers) : null;
  const matchedCover = matchedCoverId
    ? COVER_VERSIONS.find((cover) => cover.id === matchedCoverId) ?? COVER_VERSIONS[0]
    : null;
  const selectedCover = COVER_VERSIONS.find((cover) => cover.id === selectedCoverId) ?? COVER_VERSIONS[0];

  const handleCoverAnswerSelect = (questionId: string, result: CoverVersionId) => {
    const nextAnswers = {
      ...coverAnswers,
      [questionId]: result,
    };

    setCoverAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === COVER_MATCH_QUESTIONS.length) {
      setSelectedCoverId(getCoverMatchResult(nextAnswers));
    }
  };

  return (
    <section id="cover-versions" className={`${styles.coverVersionsSection} ${styles.jumpTargetSection}`} aria-labelledby="cover-versions-title">
      <motion.h2
        id="cover-versions-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Cover Versions Mixtape
      </motion.h2>

      <p className={styles.coverIntro}>
        The song travels well. These five fan-friendly starting points show how different performers keep the
        Friday spark intact while bending the mood toward live rush, soft-focus indie, swing, or full-room
        singalong.
      </p>

      <div className={styles.coverMatchmaker} aria-labelledby="cover-matchmaker-title">
        <div className={styles.coverMatchmakerHeader}>
          <p className={styles.coverMatchmakerEyebrow}>Need a fast pick?</p>
          <h3 id="cover-matchmaker-title" className={styles.coverMatchmakerTitle}>
            Cover Version Matchmaker
          </h3>
          <p className={styles.coverMatchmakerIntro}>
            Answer three quick prompts and the mixtape spotlight below will sync to the version that best fits
            your Friday mood.
          </p>
        </div>

        <div className={styles.coverMatchmakerLayout}>
          <div className={styles.coverMatchmakerQuestions}>
            <p className={styles.coverMatchmakerProgress}>
              {coverAnsweredCount === 0
                ? "Pick the mood cues that feel closest to your version of Friday."
                : `Answered ${coverAnsweredCount} of ${COVER_MATCH_QUESTIONS.length} prompts.`}
            </p>

            {COVER_MATCH_QUESTIONS.map((question) => (
              <fieldset key={question.id} className={styles.coverMatchQuestionCard}>
                <legend className={styles.coverMatchQuestionTitle}>{question.prompt}</legend>

                <div className={styles.coverMatchOptionList}>
                  {question.options.map((option) => {
                    const isSelected = coverAnswers[question.id] === option.result;

                    return (
                      <button
                        key={`${question.id}-${option.result}`}
                        type="button"
                        className={`${styles.coverMatchOption} ${isSelected ? styles.coverMatchOptionActive : ""}`}
                        onClick={() => handleCoverAnswerSelect(question.id, option.result)}
                        aria-pressed={isSelected}
                      >
                        <span className={styles.coverMatchOptionTitle}>{option.title}</span>
                        <span className={styles.coverMatchOptionDetail}>{option.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.aside
              key={matchedCover?.id ?? "cover-match-empty"}
              className={styles.coverMatchResult}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
            >
              {matchedCover ? (
                <>
                  <p className={styles.coverMatchResultKicker}>Your cover cue</p>
                  <h4 className={styles.coverMatchResultTitle}>{matchedCover.artist}</h4>
                  <p className={styles.coverMatchResultMeta}>{matchedCover.context}</p>
                  <p className={styles.coverMatchResultBody}>{matchedCover.note}</p>
                  <p className={styles.coverMatchResultHint}>
                    The mixtape spotlight below is synced to this pick, so you can keep reading or jump straight
                    to the search link.
                  </p>
                  <div className={styles.coverMatchResultActions}>
                    <a
                      href={matchedCover.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.coverMatchResultLink}
                    >
                      {matchedCover.linkLabel}
                    </a>
                    <button
                      type="button"
                      className={styles.coverMatchResetButton}
                      onClick={() => setCoverAnswers({})}
                    >
                      Reset prompts
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.coverMatchResultKicker}>Mixtape waiting room</p>
                  <h4 className={styles.coverMatchResultTitle}>Your recommendation appears after the third pick.</h4>
                  <p className={styles.coverMatchResultBody}>
                    This fast matchmaker is for fans who want the right cover mood first and the deeper write-up
                    second.
                  </p>
                </>
              )}
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.coverMoodBar} role="tablist" aria-label="Cover version moods">
        {COVER_VERSIONS.map((cover) => (
          <button
            key={cover.id}
            type="button"
            role="tab"
            id={`cover-tab-${cover.id}`}
            aria-selected={selectedCover.id === cover.id}
            aria-controls={`cover-panel-${cover.id}`}
            tabIndex={selectedCover.id === cover.id ? 0 : -1}
            className={`${styles.coverMoodButton} ${selectedCover.id === cover.id ? styles.coverMoodButtonActive : ""}`}
            onClick={() => setSelectedCoverId(cover.id)}
          >
            <span className={styles.coverMoodLabel}>{cover.label}</span>
            <span className={styles.coverMoodDescription}>{cover.description}</span>
          </button>
        ))}
      </div>

      <div className={styles.coverExplorer}>
        <div className={styles.coverListColumn}>
          <p className={styles.coverSelectionHint}>Five paths out of the original glow</p>

          <ul className={styles.coverList}>
            {COVER_VERSIONS.map((cover, index) => (
              <motion.li
                key={cover.id}
                className={styles.coverItem}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, delay: index * 0.04 }}
              >
                <button
                  type="button"
                  className={`${styles.coverPickerButton} ${selectedCover.id === cover.id ? styles.coverPickerButtonActive : ""}`}
                  onClick={() => setSelectedCoverId(cover.id)}
                  aria-pressed={selectedCover.id === cover.id}
                >
                  <span className={styles.coverArtist}>{cover.artist}</span>
                  <span className={styles.coverMeta}>{cover.context}</span>
                  <span className={styles.coverNote}>{cover.note}</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.aside
          key={selectedCover.id}
          id={`cover-panel-${selectedCover.id}`}
          role="tabpanel"
          aria-labelledby={`cover-tab-${selectedCover.id}`}
          className={styles.coverSpotlight}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
        >
          <p className={styles.coverSpotlightKicker}>{selectedCover.label}</p>
          <h3 className={styles.coverSpotlightTitle}>{selectedCover.artist}</h3>
          <p className={styles.coverSpotlightMeta}>{selectedCover.context}</p>
          <p className={styles.coverSpotlightBody}>{selectedCover.body}</p>
          <a href={selectedCover.href} target="_blank" rel="noopener noreferrer" className={styles.coverSpotlightLink}>
            {selectedCover.linkLabel}
          </a>
        </motion.aside>
      </div>

      <div className={styles.coverFooter}>
        <small className={styles.coverFooterNote}>
          Starting points adapted from{" "}
          <a
            href="https://www.covermesongs.com/2019/03/best-covers-friday-im-in-love-cure.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cover Me&apos;s Five Good Covers roundup
          </a>
          .
        </small>
      </div>
    </section>
  );
};

const FanResourcesSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<FanResourceCategoryId>("all");
  const activeFilter = FAN_RESOURCE_FILTERS.find((filter) => filter.id === selectedCategory) ?? FAN_RESOURCE_FILTERS[0];
  const filteredResources =
    selectedCategory === "all"
      ? FAN_RESOURCES
      : FAN_RESOURCES.filter((resource) => resource.category === selectedCategory);
  const spotlightResource = filteredResources[0] ?? FAN_RESOURCES[0];

  return (
    <section id="fan-resources" className={`${styles.fanResourcesSection} ${styles.jumpTargetSection}`} aria-labelledby="fan-resources-title">
      <motion.h2
        id="fan-resources-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Friday Field Guide
      </motion.h2>

      <p className={styles.fanResourcesIntro}>
        A compact link wall for the next part of your Friday rabbit hole: official pages, live-history stops,
        and collector-friendly context.
      </p>

      <div className={styles.fanResourceControls}>
        <div className={styles.fanResourceFilterGroup} role="group" aria-label="Filter Friday field guide links">
          {FAN_RESOURCE_FILTERS.map((filter) => {
            const isSelected = filter.id === selectedCategory;

            return (
              <button
                key={filter.id}
                type="button"
                className={isSelected ? styles.fanResourceFilterButtonActive : styles.fanResourceFilterButton}
                onClick={() => setSelectedCategory(filter.id)}
                aria-pressed={isSelected}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.aside
            key={selectedCategory}
            className={styles.fanResourceSpotlight}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
            aria-live="polite"
          >
            <p className={styles.fanResourceSpotlightEyebrow}>{activeFilter.eyebrow}</p>
            <div className={styles.fanResourceSpotlightHeader}>
              <div>
                <h3 className={styles.fanResourceSpotlightTitle}>{spotlightResource.title}</h3>
                <p className={styles.fanResourceSpotlightMeta}>
                  {filteredResources.length} stop{filteredResources.length === 1 ? "" : "s"} in this lane
                </p>
              </div>

              <a
                href={spotlightResource.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fanResourceSpotlightLink}
              >
                Open this stop
              </a>
            </div>

            <p className={styles.fanResourceSpotlightBody}>{activeFilter.description}</p>
            <p className={styles.fanResourceSpotlightNote}>{spotlightResource.whyVisit}</p>
          </motion.aside>
        </AnimatePresence>
      </div>

      <ul className={styles.fanResourcesList}>
        {filteredResources.map((resource, index) => (
          <motion.li
            key={resource.title}
            className={styles.fanResourceItem}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 22, rotate: index % 2 === 0 ? -0.8 : 0.8 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.32, delay: index * 0.05 }}
          >
            <a href={resource.href} target="_blank" rel="noopener noreferrer" className={styles.fanResourceLink}>
              <span className={styles.newsTickerSource}>{resource.source}</span>
              <h3 className={styles.fanResourceName}>{resource.title}</h3>
            </a>
            <p className={styles.fanResourceDesc}>{resource.description}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

const LyricsMeaningSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [selectedLyricMomentId, setSelectedLyricMomentId] = useState<LyricMomentId>(LYRIC_MOMENTS[0].id);
  const selectedLyricMoment =
    LYRIC_MOMENTS.find((moment) => moment.id === selectedLyricMomentId) ?? LYRIC_MOMENTS[0];

  return (
    <section id="lyrics-meaning" className={`${styles.infoSection} ${styles.jumpTargetSection}`} aria-labelledby="lyrics-meaning-title">
      <motion.h2
        id="lyrics-meaning-title"
        className={styles.sectionTitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Lyrics &amp; Meaning
      </motion.h2>

      <div className={styles.lyricsHeader}>
        <div className={styles.languageSelector} aria-label="Lyric summary languages">
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

        <div className={styles.lyricSummaryCard}>
          <p className={styles.lyricSummaryText}>Quick meaning summary</p>
          <p className={styles.lyricSummaryBody}>{LYRIC_SUMMARIES[selectedLanguage]}</p>
        </div>
      </div>

      <div className={styles.lyricDecoder}>
        <div className={styles.lyricDecoderHeader}>
          <p className={styles.lyricDecoderEyebrow}>Weekday Mood Decoder</p>
          <h3 className={styles.lyricDecoderTitle}>Tap each line to watch the week turn from blur into release.</h3>
          <p className={styles.lyricDecoderIntro}>
            This fan-focused read keeps to a short, legal excerpt and treats each line like one panel in the
            song&apos;s emotional collage.
          </p>
        </div>

        <div className={styles.lyricsStage}>
          <div className={styles.lyricMomentList} aria-label="Weekday lyric moments">
            {LYRIC_MOMENTS.map((moment) => {
              const isSelected = selectedLyricMoment.id === moment.id;

              return (
                <button
                  key={moment.id}
                  type="button"
                  className={`${styles.lyricMomentButton} ${isSelected ? styles.lyricMomentButtonActive : ""}`}
                  onClick={() => setSelectedLyricMomentId(moment.id)}
                  aria-pressed={isSelected}
                  aria-controls={`lyric-moment-panel-${moment.id}`}
                >
                  <span className={styles.lyricMomentDay}>{moment.tabLabel}</span>
                  <span className={styles.lyricMomentLine}>{moment.line}</span>
                  <span className={styles.lyricMomentMood}>{moment.mood}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.aside
              key={selectedLyricMoment.id}
              id={`lyric-moment-panel-${selectedLyricMoment.id}`}
              className={styles.lyricDetailPanel}
              aria-live="polite"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
            >
              <p className={styles.lyricDetailKicker}>{selectedLyricMoment.mood}</p>
              <h3 className={styles.lyricDetailTitle}>{selectedLyricMoment.headline}</h3>
              <p className={styles.lyricDetailBody}>{selectedLyricMoment.body}</p>

              <dl className={styles.lyricDetailFacts}>
                <div>
                  <dt>Collage cue</dt>
                  <dd>{selectedLyricMoment.collageCue}</dd>
                </div>
                <div>
                  <dt>Fan note</dt>
                  <dd>{selectedLyricMoment.fanNote}</dd>
                </div>
              </dl>
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

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
          <WeekdayForecastCard />
        </motion.div>

        <PatternShapes />
        <GothicSilhouette />
        {LYRICS.map((line, index) => (
          <FloatingLyric key={line} text={line} index={index} />
        ))}
      </motion.section>

      <FridayMixtapeNavigator />

      <NewsTicker />

      <section id="song-snapshot" className={`${styles.infoSection} ${styles.jumpTargetSection}`}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Song Snapshot
        </motion.h2>
        <p className={styles.sectionIntro}>
          The single&apos;s essentials are only half the story. The formats tell the rest: how The Cure framed the
          release, paced the B-sides, and let Friday sparkle in slightly different ways.
        </p>
        <SongSnapshotSection />
      </section>

      <ListenLoungeSection />
      <FridayQueueQuizSection />
      <FridayQueueSection />
      <FridayFanFlyerSection />

      <LyricsMeaningSection />

      <ChordTabsSection />
      <MusicTheoryBreakdownSection />
      <BehindTheScenesSection />
      <VideoSceneDecoderSection />
      <TourLiveMomentsSection />
      <CoverVersionsSection />
      <FanResourcesSection />
    </main>
  );
}
