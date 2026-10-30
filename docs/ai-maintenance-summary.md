# Daily maintenance — 2026-10-30

## Pull request description

Fix timing in the existing Guitar Tabs & Chords MIDI practice player. Note
positions and loop boundaries were converted from seconds to beats, then passed
to Tone.js APIs that interpret numeric times as seconds. At 138 BPM this delayed
chords, misaligned chord-card jumps, and let non-looping playback stop before
the final chords. Changing Loop during playback also left the end timer stale:
disabling looping did not return the player to idle, while enabling it could
still stop playback unexpectedly.

The player now uses MIDI seconds consistently and recalculates its end timer
from the current playhead whenever Loop changes. Enabling Loop, jumping to a
chord, and teardown cancel the previous timer. Disabling Loop completes the
current pass and clears the highlight, including when already at the end.

Chosen after inspecting the clean working tree and three recent maintenance
changes (news refresh, countdown coverage, dependency security). No failing CI
diagnostics were supplied, and official news/shows still match the recent
refresh. This fixes concrete behavior in an existing interactive section.

Changed areas:
- `src/components/chord-midi-player.tsx`: integrate consistent scheduling and
  live loop/timer updates.
- `src/lib/chord-midi-playback.ts`: extract testable event and loop timing logic.
- `src/lib/chord-midi-playback.test.ts`: nine regression cases using all three
  shipped MIDI files, multi-track chord grouping, selected-chord loop boundaries,
  loop-off completion, loop-on cancellation, jump/stop cleanup, and end-of-track
  reset. Fake timers verify completion deadlines without wall-clock waits.

## Sources

All sources checked on **2026-10-30**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “Boys Don't Cry — The Music Box” as its newest entry. | Index undated; newest entry published 2026-09-18. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site; only images returned, with no readable posts or dates. | No publication/event date verified; no social content used. |
| https://tonejs.github.io/docs/15.1.22/classes/Part.html | Tone.Part uses time-valued event positions. | Versioned technical documentation; no publication/event date stated. |
| https://raw.githubusercontent.com/Tonejs/Tone.js/15.1.22/Tone/core/clock/Transport.ts | Version-matched transport implementation returns loop boundaries in seconds and converts assigned times to ticks internally. | Versioned source; no publication/event date stated. |

The official news/shows pages and technical sources were publicly readable.
Versioned documentation URLs ending in `Transport.html` and `TransportClass.html`
returned 404; the version-tagged source above was used instead. No Chain of
Flowers link was found in the application; no fan commentary was used.

## Validation

- `pnpm install --frozen-lockfile` — passed, including supply-chain checks.
- `pnpm exec vitest run src/lib/chord-midi-playback.test.ts` — passed, nine tests.
- `pnpm typecheck` — passed.
- `pnpm check` — passed: ESLint, TypeScript, 24 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-midi-browser.mjs` (temporary CDP smoke harness, removed
  after use) — final run passed against the exported site in headless Chromium.
  Checked player control bounds at 1280px and 390px, keyboard Enter to play and
  Space to toggle Loop, current-chord highlights, completion after disabling
  Loop, continued playback after enabling Loop, and final-chord jump/reset.
  Early harness attempts needed a longer Chromium startup wait and a complete
  Enter key event; these harness issues were corrected before the passing run.
  Audio was muted; subjective sound quality and screenshot review were not checked.
- `pnpm build` after browser verification — passed; regenerated a clean static
  export after the temporary browser profile was used in the output directory.
- `git diff --check` — passed.

No unresolved application or required-check failures remain.
