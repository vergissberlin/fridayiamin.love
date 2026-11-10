# Daily maintenance — 2026-11-10

## Pull request description

Fix keyboard navigation and panel relationships in the existing Cover Versions
Mixtape. Its inactive mood tabs had `tabIndex=-1` without arrow-key handling,
and their `aria-controls` values referenced absent panels. Left/Right now select
and focus adjacent moods with wrapping; Home/End reach the first/last mood.
Every tab controls one stable spotlight panel, labelled by the selected tab.
The panel is keyboard-focusable with a visible neon-yellow outline, while its
inner content retains the existing reduced-motion-aware animation.

Chosen after reviewing the clean working tree and recent companion-track,
release-format, and live-snapshot accessibility maintenance. No failed CI
diagnostics were supplied. Current official news/shows are unchanged from the
previous review; improving another existing keyboard interaction is useful.

## Changed areas and tests

- `src/app/page.tsx`: reuse the horizontal tab-keyboard helper and retain a stable
  spotlight panel around animated cover content. Existing artist buttons and
  matchmaker selection continue to share the same selected cover.
- `src/app/page.module.css`: reuse the mood buttons' yellow focus outline for
  the spotlight panel.
- `src/app/cover-version-tabs.test.ts`: five rendered-state regressions cover
  all selected covers, one selected/tabbable mood, valid panel relationships,
  panel focusability, and matching artist content and external link. All five
  failed before the fix on the old per-cover panel references.
- Existing keyboard-helper tests cover activation/focus, wrapping, Home/End,
  ignored keys/modifiers, and empty tablists. Browser checks verify actual wiring.

## Sources

All sources checked on **2026-11-10**. No music, news, or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story and provides official social-account links. | Index undated; newest story published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” and offers announcement signup. | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the official social link from the band's site; request returned HTTP 429. | No posts or publication/event dates verified or used. |
| https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | Horizontal arrow navigation, Home/End, automatic activation, focusable panels, and ARIA relationships. | Undated guidance; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository. No fan-source material was used.

## Validation

- `pnpm exec vitest run src/app/cover-version-tabs.test.ts` — five expected
  pre-fix failures on panel references.
- `pnpm exec vitest run src/app/cover-version-tabs.test.ts src/lib/tab-keyboard.test.ts`
  — passed: 37 tests.
- `pnpm check` — passed: ESLint, TypeScript, 103 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-cover-browser.mjs` — temporary Chromium/CDP harness,
  removed after use. Initial launch timed out; a direct Chromium diagnostic
  established the debugging endpoint. The next harness attempt failed because
  it tried to serialize a DOM node; corrected the harness to return no value.
  Final run passed at 1280px with normal motion and 390px with reduced motion:
  all five moods, Left/Right wrapping, Home/End, ignored Down Arrow and Ctrl+Left,
  focus/selection, ARIA targets, stable panel identity, artist content, Tab out
  of the tablist through the existing artist buttons to the spotlight, Tab and
  Shift+Tab between panel and link, computed yellow focus outline, panel viewport
  bounds, and click selection. No screenshot review or screen-reader speech
  testing was performed.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
