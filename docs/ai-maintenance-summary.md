# Daily maintenance — 2026-11-08

## Pull request description

Fix keyboard access to the existing Release Format Guide. Inactive formats had
`tabIndex=-1` without arrow-key navigation, making the 12-inch and CD routes
unreachable from the tablist by keyboard. The vertically stacked tabs now declare
their orientation and support Up/Down with wrapping, Home, and End. Selection
follows focus, and the existing companion board stays in sync with the format.
Tab reaches a labelled content panel before its source link. All tabs control
that stable panel throughout the existing content animations; tabs and panel
have a visible neon-yellow focus outline.

Chosen after inspecting the clean working tree and recent snapshot-tab,
scene-tab, and official-show-link maintenance. No failed CI diagnostics were
supplied. Official news/shows match the recent refresh; repairing access to
existing release details is a useful, focused improvement.

## Changed areas and tests

- `src/app/page.tsx`: reuse the tested vertical keyboard handler and add a stable,
  focusable, labelled panel around the existing animated format article.
- `src/app/page.module.css`: add the matching focus outline and panel wrapper styles.
- `src/app/release-format-guide.test.ts`: three rendered-state regressions cover
  vertical orientation, one selected/tabbable tab, valid shared panel targets,
  panel label/focusability, format track counts, and available companion tracks.
  All three failed against the original markup on the missing shared panel target.
- Existing keyboard-helper tests cover activation/focus, wrapping, Home/End,
  ignored keys/modifiers, and empty tablists.

## Sources

All sources checked on **2026-11-08**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story and supplies official social links. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” and offers announcement signup. | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the official social link from the band's site; returned HTTP 429. | Inaccessible; no post or publication/event date verified or used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Vertical orientation, Up/Down, Home/End, automatic activation, focusable panels, and ARIA relationships. | Undated guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository; instructions mention it by name only.
No fan-source material was used.

## Validation

- `pnpm exec vitest run src/app/release-format-guide.test.ts` — three expected
  pre-fix failures on the shared panel target.
- `pnpm exec vitest run src/app/release-format-guide.test.ts src/lib/tab-keyboard.test.ts`
  — passed: 35 tests.
- `pnpm check` — passed: ESLint, TypeScript, 94 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-release-formats-browser.mjs` — temporary CDP harness,
  removed after use. Initial launch could not expose the debugging endpoint;
  rerun with a dedicated Chromium profile passed at 1280px with normal motion
  and 390px with reduced motion. Verified actual Up/Down navigation, wrapping,
  Home/End, ignored Right Arrow and Ctrl+Up, focused/selected state, valid ARIA
  targets, updated track/companion counts, Tab/Shift+Tab order, panel outline,
  and panel viewport bounds. No screenshot review or screen-reader speech
  testing was performed.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
