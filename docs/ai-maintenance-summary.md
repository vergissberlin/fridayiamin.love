# Daily maintenance — 2026-11-11

## Pull request description

Add missing regression coverage for the Friday countdown in fractional-offset
time zones. Existing DST cases covered only one-hour changes and did not
explicitly distinguish the local Friday boundary from the UTC calendar.
The new cases protect local-midnight targeting and minute-accurate elapsed time
when clocks change by half an hour.

Chosen after reviewing the clean working tree and recent tab-accessibility
maintenance. No failed CI diagnostics or unfinished work were supplied. Official
news and shows remain unchanged from the previous review; this focused test gap
provides useful protection for an existing feature used across time zones.

## Changed areas and tests

- `src/lib/friday-countdown-calendar.test.ts`: five new parameterized cases.
- Kathmandu (+05:45), Eucla (+08:45), and St. John's (-03:30) each check two
  seconds before local Friday, exactly midnight, and one millisecond afterward.
  Fixture guards verify offsets and differing UTC/local weekdays. The checks
  also confirm that calculating the countdown preserves the input timestamp.
- Lord Howe cases span the April and October half-hour DST changes and expect
  six days plus 30 minutes, and five days plus 23 hours and 30 minutes,
  respectively. Guards verify local Saturday/Friday midnights and the 30-minute
  offset difference. Expected results are explicit, not calculated by copying
  the countdown algorithm.
- These are coverage additions for currently correct behavior; no bug fix or
  pre-fix failure is claimed.

## Sources

All URLs checked on **2026-11-11**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; newest entry remains “HEART RESEARCH AUCTION”; supplies official social links. | Index undated; newest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Followed the band's official social link; request timed out. | No posts or publication/event dates verified or used. |
| https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date | Public guidance on host-local date methods, UTC methods, and offsets changing across DST. | Page last modified 2025-12-08; no event date. |
| https://data.iana.org/time-zones/tzdb/australasia | Public timezone data: Eucla +08:45; Lord Howe +10:30 with 30-minute DST, ending the first Sunday in April and beginning the first Sunday in October. | File has no single publication date; rules imply transitions on 2026-04-05 and 2026-10-04. |
| https://www.timeanddate.com/time/change/australia/lord-howe-island?year=2026 | HTTP 403; not used as evidence. | No publication/event dates verified from this page. |
| https://www.lhib.nsw.gov.au/community/island-services/daylight-saving-time | HTTP 404; not used as evidence. | No publication/event dates verified from this page. |

No linked Chain of Flowers URL was found in the repository; the maintenance
instructions mention it by name only. No fan-source material was used.
Timezone fixtures also verify the runtime's actual offsets and local weekdays.

## Validation

- `pnpm exec vitest run src/lib/friday-countdown-calendar.test.ts src/lib/friday-countdown.test.ts`
  — passed: 19 tests, including the five new cases.
- `pnpm check` — passed: ESLint, TypeScript, 108 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
