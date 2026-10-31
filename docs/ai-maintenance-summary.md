# Daily maintenance — 2026-10-31

## Pull request description

Fix keyboard access in the existing Friday Cure Queue. Its mood controls exposed
tab roles but lacked arrow-key navigation, placed all four tabs in the page's
Tab sequence, and pointed inactive tabs at nonexistent panels.

The queue now has one tab stop. Left/Right select and focus the adjacent mood
with wrapping; Home/End jump to the first/last mood. Tab reaches the content
panel, then its Spotify links; Shift+Tab returns to the selected mood. Vertical
arrows and modified browser shortcuts retain their native behavior. All tabs
reference one stable, correctly labelled panel with a visible focus outline.
Mood changes update that panel immediately, avoiding the previous exit-animation
delay during automatic keyboard activation. The initial entrance still respects
reduced motion.

Chosen after inspecting a clean working tree and recent MIDI, dependency, and
countdown maintenance summaries. No failing CI diagnostics were supplied. The
official news/shows still match the recent refresh, making this concrete
accessibility gap a useful small improvement.

Changed areas and tests:
- `src/app/page.tsx` and `page.module.css`: queue keyboard interaction, roving
  tab stops, stable panel semantics, and panel focus styling.
- `src/lib/tab-keyboard.ts` and its test: 16 behavior cases covering adjacent
  navigation, wrapping, Home/End, native keys, modified shortcuts, and empty lists.
- `src/app/friday-queue.test.ts`: server-render regression for the single active
  tab stop, selection state, valid panel references, and panel labelling/focusability.
- `src/app/news-reel.test.ts`: resolve the new utility import in the existing
  page-render test using its established module-mock pattern.

## Sources

All sources checked on **2026-10-31**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “Boys Don't Cry — The Music Box” as its newest entry. | Index undated; newest entry published 2026-09-18. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site. Only images returned, with no readable posts or dates. | No publication/event date verified; no social content used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Standard horizontal-tab keyboard behavior, automatic activation without latency, panel focusability, and ARIA relationships. | Undated technical guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No Chain of Flowers
link was found in the application; no fan commentary was used.

## Validation

- `pnpm install --frozen-lockfile` — passed, including supply-chain checks.
- `pnpm exec vitest run src/lib/tab-keyboard.test.ts` — passed, 16 tests.
- `pnpm check` — passed: ESLint, TypeScript, 41 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.
- `node scripts/check-queue-browser.mjs` (temporary CDP harness, removed after
  use) — final run passed against the exported site in headless Chromium at
  1280px with normal motion and 390px with reduced motion. Checked real keyboard
  events for wrapping, Home/End, Tab/Shift+Tab, panel focus outline, pointer mood
  selection, selection/panel ARIA consistency, and queue viewport bounds. The
  first run's mobile pointer assertion failed because keyboard navigation had
  scrolled the target outside the viewport; scrolling it into view corrected the
  harness before the passing run. No screenshot or screen-reader review performed.

No unresolved application or required-check failures remain.
