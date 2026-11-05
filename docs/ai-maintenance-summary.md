# Daily maintenance — 2026-11-05

## Pull request description

Repair three broken official tour links in the live-era timeline, live-set
snapshots, and fan resources. The old `/tour/` destination returns HTTP 404;
the band's navigation now uses `/shows/`. Visitors can reach the working official
show-announcement page, with labels and resource descriptions that accurately
describe it rather than promising a historical archive. Live-era copy now
explicitly identifies the descriptions and snapshots as fan commentary.

This run repairs the existing pull request after CI reported missing regression
coverage matching `src/**/*.test.ts`. It retains the broken-link fix and adds
coverage for its rendered navigation; no different feature was added.

## Changed areas and tests

- `src/app/page.tsx`: replace all three obsolete official tour URLs, rename
  archive labels, clarify the fan-resource destination, and distinguish fan
  interpretation from official announcements. The listening-lane description
  now points readers to fan-maintained statistics rather than an unavailable archive.
- `src/app/official-show-links.test.ts`: renders the modern live-era state and
  verifies that both source links and the official fan-resource link use `/shows/`,
  retain safe new-tab attributes, and never render the obsolete `/tour/` URL.
  Uses the existing server-render test approach without live network assertions.
- Regression reproduced by temporarily restoring all three obsolete URLs: the
  new test failed on the timeline destination (69 existing tests passed). The
  repaired URLs were then restored before full validation.

## Sources

All sources checked on **2026-11-05**. No news or tour announcements were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/tour/ | Old link returned HTTP 404, reproducing the broken destination before the fix. | Unavailable; no publication/event date verified. |
| https://www.thecure.com/shows/ | Working official destination, linked from band navigation; states “No shows currently announced!” and links to tour-announcement signup. Supports the revised resource description, not historical setlist commentary. | Undated; no upcoming event dates listed. |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story. Also provides official social links. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://instagram.com/thecure/ | Followed the official social link from the band's site; request returned HTTP 429. | Inaccessible on this check; no post or publication/event date verified or used. |

Official news and shows were publicly readable. No Chain of Flowers URL was
found in the repository; instructions mention the resource only by name. No new
fan-source material was used. Existing live-era commentary is explicitly labeled.

## Validation

- `pnpm test -- src/app/official-show-links.test.ts` — expected failure with the
  obsolete URLs temporarily restored; the runner executed all 70 tests, with only
  the new regression test failing.
- `pnpm check` — passed: ESLint, TypeScript, 70 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.
- No browser automation tool was available; desktop/mobile rendering and keyboard
  interaction were not browser-verified. Destination checks used public web fetches.

No unresolved failures or next repair remain.
