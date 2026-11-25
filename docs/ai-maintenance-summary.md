# Daily maintenance — 2026-11-25

## Pull request description

Pause local-date clocks in hidden tabs and refresh immediately on return.
The countdown previously requested updates every second even in the background;
the weekday progress and forecast also kept their minute timers running. A visitor
returning across midnight could see stale information until the next interval.
All three clocks now stop their intervals while hidden, read the current date on
return, and resume their existing visible refresh rates.

The working tree was clean, no failed CI diagnostics were supplied, and recent
maintenance history was reviewed. Official news and shows listings are unchanged.
This small performance and freshness improvement benefits existing interactions.

## Changed areas and tests

- `src/lib/visible-clock.ts`: shared visibility-aware interval lifecycle, including
  immediate visible refresh and removal of the timer and listener during cleanup.
- `src/app/page.tsx`: use that lifecycle for the Friday countdown, weekday progress,
  and weekday forecast. Initial date state remains `null` for deterministic rendering.
- `src/lib/visible-clock.test.ts`: seven fake-timer cases cover second/minute refresh
  rates, no background work, immediate current-date refresh across midnight,
  mounting while hidden, repeated visibility events without duplicate intervals,
  and cleanup while visible or hidden without subsequent updates or restarts.
  Tests use an EventTarget visibility stub, not a browser rendering environment.
- Nine existing `src/app/*.test.ts` files: map the new aliased import to the real
  utility, following their existing import mappings; all assertions are retained.

## Sources

All sources checked on **2026-11-25**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the official social link; identifies The Cure but returns navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified fan-contributed resource URL in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

Implementation and test expectations derive from the existing local-date clocks
and the browser visibility lifecycle.

## Validation

- `pnpm exec vitest run src/lib/visible-clock.test.ts` — passed **7 tests**.
- First `pnpm check` — lint and TypeScript passed; nine page test suites failed to
  resolve the new `@/lib/visible-clock` import. Added the existing-style per-file
  import mappings, then reran the full command.
- Final `pnpm check` — passed ESLint, TypeScript, **149 application tests**,
  **23 feature automation tests**, **27 maintenance tests**, and the Next.js
  **16.4.5** static production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities found**.
- `git diff --check` — passed.
- Browser verification was unavailable in this tool environment; no visual,
  keyboard, or real-browser background-tab review was performed.

No unresolved check failures or required repairs remain.
