# Daily maintenance — 2026-11-09

## Pull request description

Fix keyboard access to the existing Single Companion Board. Inactive track tabs
had `tabIndex=-1` without arrow-key navigation, leaving Scared as You and
Strangelove Mix unreachable from the tablist by keyboard. The vertically stacked
tabs now support Up/Down with wrapping, Home, and End, with selection following
focus. Tab reaches a labelled content panel before its source link. Every tab
controls that stable panel throughout the existing content animations, and the
panel has a visible neon-yellow focus outline.

Chosen after reviewing the clean working tree and recent release-format,
snapshot-tab, scene-tab, and official-show-link maintenance. No failing CI
diagnostics were supplied. Official news/shows are unchanged from the previous
review; fixing access to existing companion tracks is a focused visitor benefit.

## Changed areas and tests

- `src/app/page.tsx`: reuse the vertical keyboard handler, declare orientation,
  and wrap the existing animated companion content in a stable, focusable panel.
- `src/app/page.module.css`: reuse the companion controls' yellow focus outline
  for the panel and preserve the panel's rounded layout at narrow widths.
- `src/app/single-companion-board.test.ts`: four rendered-state regressions
  cover track selection across all release formats, one selected/tabbable tab,
  valid panel relationships, panel focusability/content, and fallback to Halo
  when a previously selected track is unavailable on the 7-inch format.
  All four failed before the fix on missing vertical orientation.
- Existing keyboard-helper tests cover activation/focus, wrapping, Home/End,
  ignored keys/modifiers, and empty tablists. Browser checks exercise the wiring.

## Sources

All sources checked on **2026-11-09**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story and supplies official social links. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” and offers announcement signup. | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the band's official social link; response contained only images, with no readable posts or dates. | No post or publication/event date verified or used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Vertical orientation, Up/Down, Home/End, automatic activation, focusable panels, and ARIA relationships. | Undated guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository; maintenance instructions mention it by
name only. No fan-source material was used.

## Validation

- `pnpm exec vitest run src/app/single-companion-board.test.ts` — four expected
  pre-fix failures on missing vertical orientation.
- `pnpm exec vitest run src/app/single-companion-board.test.ts src/lib/tab-keyboard.test.ts`
  — passed: 36 tests.
- `pnpm check` — passed: ESLint, TypeScript, 98 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-companion-browser.mjs` — temporary CDP harness, removed
  after use. First launch did not expose a debugging endpoint; after a direct
  Chromium startup diagnostic, rerun passed at 1280px with normal motion and
  390px with reduced motion. Verified actual Up/Down navigation, wrapping,
  Home/End, ignored Right Arrow and Ctrl+Up, focus/selection, ARIA targets,
  updated content, Tab/Shift+Tab order, visible panel outline, panel viewport
  bounds, and switching from Strangelove Mix to the single-track 7-inch format.
  No screenshot review or screen-reader speech testing was performed.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
