# Daily maintenance — 2026-11-03

## Pull request description

Fix the Friday countdown's live-region semantics. Its enclosing polite live
region updated every second, making ordinary ticks eligible for unsolicited
screen-reader announcements. The countdown now has a named `timer` role with
`aria-live="off"`: its current values remain available when visitors read it.
The Friday celebration retains its separate `status` role and stable content.

Chosen after reviewing a clean working tree and recent news-refresh, quiz-test,
and queue-keyboard summaries. No failed CI diagnostics were supplied. Official
news and shows still match yesterday's refresh; this existing accessibility gap
is a useful small improvement.

Changed areas and tests:
- `src/components/friday-countdown-display.tsx`: extract the existing display
  and correct the semantics, reusing the same CSS classes and visible content.
- `src/app/page.tsx`: pass the existing client-clock state into the display.
- `src/components/friday-countdown-display.test.ts`: three regression tests cover
  the deterministic pre-mount render, readable ticking values without a polite
  or assertive live region, and the stable Friday status at midnight.
- Existing news/queue render tests resolve the extracted component and stylesheet
  using their established import-mock pattern.

## Sources

All sources checked on **2026-11-03**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site; request returned HTTP 429. | No post or publication/event date verified; no social content used. |
| https://www.w3.org/TR/wai-aria-1.2/#timer | A countdown is a timer; this role has implicit `aria-live="off"`. | W3C Recommendation published 2023-06-06; no event date. |

Official news/shows and W3C guidance were publicly readable. No linked Chain of
Flowers URL was found in the repository; no fan commentary was used.

## Validation

- `pnpm exec vitest run src/components/friday-countdown-display.test.ts` — before
  the semantic fix, failed as expected: one failure for missing timer semantics,
  two passes. pnpm installed the locked dependencies and passed supply-chain checks.
- `pnpm check` — passed after the fix: ESLint, TypeScript, 66 application tests,
  23 feature automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-countdown-browser.mjs` — temporary CDP harness, removed
  after use. Final run passed against the exported site in headless Chromium
  at 1280px with normal motion and 390px with reduced motion. Verified readable
  second-by-second values, the named accessibility-tree timer, explicit DOM
  live-off semantics without a polite/assertive ancestor, countdown viewport
  bounds, transition into Friday, and unchanged status markup on the next tick.
  The first harness run incorrectly expected Chromium's accessibility tree to
  include a literal live-off property; Chromium omits it. Corrected the harness
  to reject polite/assertive tree properties while checking explicit DOM live-off.
  No screenshot, keyboard, or screen-reader speech review was performed.
- `git diff --check` — passed.

No unresolved application or required-check failures remain.
