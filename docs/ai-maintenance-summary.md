# Daily maintenance — 2026-11-20

## Pull request description

Make repeated guitar-practice chords distinguishable to screen-reader users.
Previously the seven verse buttons exposed only four distinct accessible names:
repeated D, A, and E chords did not identify which playback position they started.
Each button now includes its step and progression length, for example,
“Play progression from chord D, step 5 of 7.” This applies to verse, chorus, and
bridge, retaining the chord name and playback action.

The working tree was clean and no failed CI diagnostics or unfinished work were
supplied. Recent maintenance summaries and current official news/show listings
were reviewed; the official listings are unchanged. This small accessibility fix
improves navigation within the existing practice section.

## Changed areas and tests

- `src/app/page.tsx`: add ordinal positions to the chord playback button names.
- `src/app/chord-practice-accessibility.test.ts`: render the page and verify that
  all seven initial chord controls have distinct accessible labels, retain their
  visible chord names, and identify their ordered playback steps and action.
  The test failed before the fix with four unique names instead of seven.
- A temporary Chromium/CDP harness additionally checked all three progressions
  after selection, using the real browser accessibility tree.

## Sources

All sources checked on **2026-11-20**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/news/2026/11/heart-research-auction/ | Accessible official article confirms Robert Smith's artwork contribution and the announced auction deadline; existing site copy remains consistent. No auction outcome inferred. | Published 2026-11-02; announced closing date 2026-11-08 at 9pm, timezone unstated. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer, without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

The accessibility issue was established from the local chord controls, not
external commentary.

## Validation

- `pnpm exec vitest run src/app/chord-practice-accessibility.test.ts` — failed
  before the fix as expected, then passed the new regression test after the fix.
- `pnpm check` — passed ESLint, TypeScript, **137 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities
  found**.
- `node scripts/check-chord-labels.mjs` — temporary harness, removed after use;
  passed for verse, chorus, and bridge at **1280px and 390px**, with reduced motion
  enabled. Verified unique browser accessibility-tree names with correct steps,
  Tab navigation from the first to second chord, visible focus styling, and all
  chord-button bounds within the viewport. No screenshot, screen-reader speech,
  or audible-output review was performed.
- `git diff --check` — passed.

No unresolved check failures or required repairs remain.
