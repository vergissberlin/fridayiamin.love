# Daily maintenance — 2026-10-28

## Pull request description

Add missing regression coverage for the Friday countdown's local-calendar
behavior. Its existing four tests did not cover daylight-saving transitions,
year/month rollover, leap days, or the millisecond immediately after Friday
begins. A fixed-duration implementation could pass those tests while reaching
the wrong local hour after a clock change.

The working tree was clean and no failing-check diagnostics were supplied.
Yesterday's official-news refresh still matches the public sources, so focused
behavior tests were the most useful small follow-up.

Added `src/lib/friday-countdown-calendar.test.ts` with ten cases calling the real
countdown helper. Six check local Friday midnight across spring/fall clock
changes in Europe/Berlin, America/New_York, and Australia/Sydney, including the
opposite-season southern hemisphere. Four cover New Year's Day, leap-day
rollover, and the next-week countdown one millisecond after Friday starts.
Expected durations are explicit; timezone fixtures are checked and each test
restores the environment. These tests protect the existing behavior; they all
passed against the current implementation.

## Sources

All sources below were checked on **2026-10-28**. Research informed the choice of
maintenance task; no new news or tour claims were added to the site.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index still lists “Boys Don't Cry — The Music Box” as its newest entry. | Index is undated; newest entry lists publication date 2026-09-18. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated page; no upcoming event dates listed at access time. |
| https://instagram.com/thecure/ | Official social-account link followed from the band's site. Fetch returned only images, with no readable posts or dates. | No publication/event date could be verified; no social content used. |

No Chain of Flowers link was found in `src/`; no fan commentary was used.

## Verification

- `pnpm exec vitest run src/lib/friday-countdown-calendar.test.ts` — passed:
  ten new regression cases.
- `pnpm check` — passed: ESLint, TypeScript, 15 application tests, 23 feature
  automation tests, 27 maintenance tests, and the Next.js static production build.
- `pnpm audit --prod --audit-level=high` — exit 0; no high/critical findings.
  One moderate vulnerability remains reported.

No required checks remain failing. The moderate dependency finding remains a
follow-up for dependency maintenance.
