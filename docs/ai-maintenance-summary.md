# Daily maintenance — 2026-10-29

## Pull request description

Fix the remaining moderate production dependency vulnerability by updating
Next.js's locked `baseline-browser-mapping` dependency from 2.10.11 to 2.11.33.
GHSA-w5vr-8v7q-w6rv describes process termination on invalid input in versions
before 2.11.0. The initial production audit reproduced the finding via
`next > baseline-browser-mapping`.

This closes the dependency follow-up recorded in the previous two maintenance
summaries. The working tree was clean and no failing-check diagnostics were
supplied. Official news and shows still match the recent content refresh, making
this verified security fix a useful small improvement.

Only `pnpm-lock.yaml` and this summary changed. Next.js allows `^2.9.19`, so
2.11.33 satisfies its declared range and reuses the patched version already
locked for Browserslist. The obsolete vulnerable package entry was removed.
The dependency now uses the patched error-handling behavior instead of exiting
the process on invalid input. Direct dependency declarations remain compatible.

## Sources

All sources below were checked on **2026-10-29**. No news or tour claims were
added to the site.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://github.com/advisories/GHSA-w5vr-8v7q-w6rv | Moderate denial-of-service advisory; affected versions are >=2.0.0 and <2.11.0, fixed in 2.11.0. | Published 2026-08-13; updated 2026-09-08. |
| https://registry.npmjs.org/next/16.4.3 | Package metadata, queried with `pnpm view next@16.4.3 dependencies --json`, confirms the allowed `baseline-browser-mapping` range is `^2.9.19`. | No publication date returned by this query; not an event source. |
| https://www.thecure.com/news/ | Public official index still lists “Boys Don't Cry — The Music Box” as its newest entry. | Index is undated; newest entry lists publication date 2026-09-18. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated page; no upcoming event dates listed at access time. |
| https://instagram.com/thecure/ | Official social-account link followed from the band's site. Fetch returned only images, with no readable posts or dates. | No publication/event date could be verified; no social content used. |

No Chain of Flowers URL was found in the repository; no fan commentary was used.
The official news, shows, and advisory pages were publicly readable.

## Tests and validation

No application logic changed, so no new behavior tests were added. Existing
application tests and the production build verify compatibility with the patched
dependency; the audit verifies removal of the reported vulnerable version.

- Before the fix, `pnpm audit --prod --audit-level=high` exited 0 but reported
  one moderate vulnerability. `pnpm audit --prod --json` identified the exact
  vulnerable version and dependency path.
- `pnpm install --frozen-lockfile` — passed, including lockfile supply-chain
  checks; installed the targeted dependency graph successfully.
- `pnpm check` — passed: ESLint, TypeScript, 15 application tests, 23 feature
  automation tests, 27 maintenance tests, and the Next.js static production build.
- `pnpm audit --prod --audit-level=high` after the fix — passed, exit 0:
  **No known vulnerabilities found**.

No unresolved failures or next repair remain.
