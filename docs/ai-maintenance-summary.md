# Daily maintenance — 2026-10-27

## Pull request description

Refresh the existing Cure News Reel with verified official updates. Its three
2024 headlines included a generic news-index link and unverified article links,
despite the section describing them as fresh headlines. Replacing those entries
was a small, useful accuracy improvement after recent route-planner features.
This repair continues that existing refresh: CI rejected the source change because
it lacked a regression test matching `src/**/*.test.ts`.

The existing `src/app/page.tsx` changes link directly to the official music-box
and Rock en Seine announcements, identify the livestream as a past event, and
replace the old festival announcement with a dated official shows-page check.
The heading now says “Official updates.” The shows card explicitly labels its
date as a check date rather than a publication or event date.

Added `src/app/news-reel.test.ts` using the existing Vitest configuration. It
renders the actual page and checks the visible headline's publication date,
official attribution, direct article link, and safe new-tab attributes. It also
checks that all three refreshed headlines have accessible selectors, that only
the initial headline is selected, and that the other selectors retain the
past-event and dated-observation context. Unrelated MIDI playback is stubbed;
the News Reel and its rendering are real. No application behavior was added
during this repair.

## Sources

All sources below were checked on **2026-10-27**.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official news index; lists the music-box announcement as its newest entry at access time. | Index is undated; individual posts have dates. |
| https://www.thecure.com/news/2026/09/boys-dont-cry-the-music-box/ | Music box announcement, Andy Vella artwork, and proceeds donated to Doctors Without Borders. | Published 2026-09-18; no separate event date stated. |
| https://www.thecure.com/news/2026/08/rock-en-seine-live-stream/ | Announcement of a worldwide livestream for the Rock en Seine headline set concluding the 31-show festival summer. | Published 2026-08-30; announced performance/livestream also 2026-08-30. The card makes no claim about replay availability. |
| https://www.thecure.com/shows/ | Explicitly states “No shows currently announced!”; this is a dated observation, not a new tour announcement. | Undated page; no upcoming event dates listed when checked. |
| https://instagram.com/thecure/ | Official account URL followed from the band's site. No social content was used. | Unavailable to the fetch tool: HTTP 429; no post or date could be verified. |

The official news articles and shows page were publicly readable. No Chain of
Flowers link was found in `src/`; no fan commentary was used.

## Verification

- `pnpm test -- src/app/news-reel.test.ts` — passed: Vitest ran both discovered
  application test files, including the new rendering regression (5 tests total).
- `pnpm check` — passed: ESLint, TypeScript, 5 application tests, 23 feature
  automation tests, 27 maintenance tests, and the Next.js static production build.
- `pnpm audit --prod --audit-level=high` — exit 0; no high/critical findings.
  One moderate vulnerability remains reported.

No required checks remain failing. The moderate dependency finding remains a
follow-up for dependency maintenance; future news refreshes should recheck the
shows page.
