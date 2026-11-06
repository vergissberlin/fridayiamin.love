# Daily maintenance — 2026-11-06

## Pull request description

Fix keyboard navigation in the existing Video Scene Decoder. Its inactive tabs
were removed from the Tab sequence but had no arrow-key handler, preventing
keyboard-only visitors from choosing other scenes. The vertically stacked tabs
now declare their orientation and support Up/Down with wrapping, Home, and End.
Selection follows focus; Tab reaches the labelled content panel, then its video
link. The panel has a visible focus outline and a stable ID throughout the
existing scene animations, so every tab points to a mounted panel.

Chosen after inspecting a clean working tree and recent show-link, MIDI-test,
and countdown-accessibility maintenance. No failed CI diagnostics were supplied.
Official news/shows match the recent refresh; this existing accessibility gap
offers a small, useful improvement without adding a new section.

## Changed areas and tests

- `src/app/page.tsx`: wire vertical navigation into the scene tabs and add a
  stable, focusable panel wrapper around the existing animated article.
- `src/app/page.module.css`: reuse the neon-yellow focus treatment for the panel.
- `src/lib/tab-keyboard.ts`: share the keyboard implementation between horizontal
  and vertical entry points; preserve the queue's horizontal behavior.
- `src/lib/tab-keyboard.test.ts`: add 16 vertical-navigation cases covering
  activation/focus, wrapping, Home/End, unhandled keys, modifiers, and empty lists.
- `src/app/video-scene-decoder.test.ts`: regression coverage for vertical semantics,
  one tabbable tab, stable control targets, and the labelled, focusable panel.
  This test failed against the original markup before the fix.

## Sources

All sources checked on **2026-11-06**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story; provides official social links. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” and offers announcement signup. | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the official social link from the band's site; returned HTTP 429. | Inaccessible; no post or publication/event date verified or used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Vertical-tab Up/Down behavior, automatic activation, Home/End, focusable panels, and ARIA relationships. | Undated guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository; instructions mention it by name only.
No fan-source material was used.

## Validation

- `pnpm exec vitest run src/app/video-scene-decoder.test.ts` — failed as expected
  before the fix: missing vertical orientation.
- `pnpm check` — passed: ESLint, TypeScript, 87 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-video-decoder-browser.mjs` — temporary CDP harness, removed
  after use. Passed against the exported site in headless Chromium at 1280px with
  normal motion and 390px with reduced motion. Checked actual keyboard activation,
  wrapping, Home/End, unhandled Right Arrow, focused/selected state, ARIA targets,
  updated content, Tab/Shift+Tab order, panel outline, and section viewport bounds.
  No screenshot review or screen-reader speech testing was performed.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
