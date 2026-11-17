# Daily maintenance — 2026-11-17

## Pull request description

Fix silent failure when the practice player loads a valid MIDI file containing
no notes. Previously it allocated a synth and returned without starting playback
or explaining the failure. It now rejects the empty timeline before allocating
audio resources, uses the existing error alert and cleanup, and permits a fresh
retry that can successfully play the progression.

Chosen after reviewing the clean working tree and recent maintenance summaries.
No failed CI diagnostics or unfinished work were supplied. Official news and
show listings are unchanged; this is a small error-recovery improvement to the
existing practice feature. The shipped MIDI assets are not empty.

## Changed areas and tests

- `src/components/chord-midi-player.tsx`: build and validate the note timeline
  before creating the synth; route empty timelines through existing error handling.
- `src/components/chord-midi-player.test.ts`: two regression cases cover no tracks
  and multiple tracks without notes. They check error reporting, no synth or
  transport start, cleared highlighting, a fresh fetch on retry, and successful
  playback/highlighting after retry.

## Sources

All sources checked on **2026-11-17**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer, without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL appears in the site's source links. The bug and expected
recovery behavior were established from the local player and regression tests.

## Validation

- `pnpm exec vitest run src/components/chord-midi-player.test.ts -t 'rejects MIDI'`
  — both new cases failed before the fix because no error was reported.
- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **17 player tests** after the fix.
- `pnpm check` — passed ESLint, TypeScript, **134 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the static production build.
- `node scripts/check-empty-midi-browser.mjs` — temporary Chromium/CDP harness,
  removed after use. Initial harness startup failed on a CommonJS named import;
  corrected the harness import, then passed at **1280px and 390px**. Served a real
  empty MIDI first and the shipped verse asset on retry. Checked the visible
  alert, enabled Play button, pressed state, fresh fetch, successful transition
  to Stop, alert removal, stopping playback, and player overflow bounds. No
  screenshot, keyboard-navigation, screen-reader, or audible-quality review.
- `pnpm audit --prod --audit-level=high` — exit **0**, with **two moderate** Next.js
  findings and no high/critical findings; this is not a clean audit.
- `pnpm audit --prod` — exit **1**, confirming those moderate findings:
  [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) and
  [GHSA-vc7v-qv4w-wrv8](https://github.com/advisories/GHSA-vc7v-qv4w-wrv8).
  The audit reports Next.js 16.4.3 affected and 16.4.5 or later patched;
  advisory publication dates were not independently checked.
- `git diff --check` — passed.

No required check failures remain. Follow-up: update Next.js and its matching
ESLint package to a patched version, then rerun the full checks and production
audit to resolve the two moderate advisories.
