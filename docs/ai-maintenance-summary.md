# Daily maintenance — 2026-11-07

## Pull request description

Fix keyboard navigation in the existing Live Set Snapshot tabs. Inactive eras
had `tabIndex=-1` but no arrow-key handler, leaving three snapshots unreachable
from the tablist by keyboard. Left/Right now select and focus adjacent eras with
wrapping; Home/End jump to the first/last era. Tab reaches the labelled snapshot
panel, which has a visible neon focus outline, then the era-comparison controls.
Every tab controls the same mounted panel throughout the existing animations.

Chosen after reviewing the clean working tree and recent scene-tab, show-link,
MIDI-test, and countdown maintenance. No failed CI diagnostics were supplied.
Official news/shows still match the recent refresh; this related keyboard gap
prevents access to an existing feature and is a focused improvement.

## Changed areas and tests

- `src/app/page.tsx`: reuse the tested horizontal-tab keyboard handler and wrap
  the animated snapshot in a stable, focusable, labelled panel.
- `src/app/page.module.css`: share the existing tab focus outline with the panel.
- `src/app/live-set-snapshot.test.ts`: four rendered-state regressions cover all
  eras, one selected/tabbable tab, valid shared control targets, and the panel's
  label and keyboard reachability. All four failed against the original markup
  because the tabs did not control a shared stable panel.
- `src/app/official-show-links.test.ts`: identify the modern snapshot by its
  accessible label rather than the replaced panel ID; retain all link assertions.
- Existing horizontal keyboard-helper tests cover activation/focus, wrapping,
  Home/End, scrolling keys, modifiers, and empty tablists.

## Sources

All sources checked on **2026-11-07**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story and supplies official social links. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” and offers announcement signup. | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the official social link from the band's site; returned HTTP 429. | Inaccessible; no post or publication/event date verified or used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Horizontal-tab arrow keys, automatic activation, Home/End, focusable panels, and ARIA relationships. | Undated guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository; maintenance instructions mention it by
name only. No fan-source material was used.

## Validation

- `pnpm exec vitest run src/app/live-set-snapshot.test.ts` — four expected
  pre-fix failures on the shared panel target, after correcting an initial test
  selector to account for HTML-escaped apostrophes.
- `pnpm exec vitest run src/app/live-set-snapshot.test.ts src/app/official-show-links.test.ts src/lib/tab-keyboard.test.ts`
  — passed: 37 tests.
- `pnpm check` — passed: ESLint, TypeScript, 91 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-live-tabs-browser.mjs` — temporary CDP harness, removed
  after use. Passed against the exported site in headless Chromium at 1280px
  with normal motion and 390px with reduced motion. Verified actual keyboard
  activation, wrapping, Home/End, ignored Down Arrow and Ctrl+Right, selected and
  focused state, valid ARIA targets, updated snapshot meters/content, forward and
  reverse Tab order, panel outline, and section viewport bounds. No screenshot
  review or screen-reader speech testing was performed.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
