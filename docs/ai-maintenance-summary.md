# Daily maintenance — 2026-11-02

## Pull request description

Refresh the existing Cure News Reel with today's official announcement of Robert
Smith's artwork contribution to Heart Research UK's anonymous heART project.
The first card links to the band's announcement, distinguishes its November 2
publication date from the scheduled November 8 auction close, and directs
visitors to the source for details. It avoids an evergreen “live now” claim.
The music-box story remains accessible as the second card, replacing the old
Rock en Seine livestream item. The shows card records today's verified check:
no upcoming shows were listed on the official page.

Chosen after inspecting a clean working tree and recent quiz-coverage,
keyboard-access, and MIDI-playback maintenance summaries. No failed CI
diagnostics were supplied. A newly published, verifiable official story makes a
small content refresh useful today.

Changed areas and tests:
- `src/app/page.tsx`: refresh only the existing three news entries.
- `src/app/news-reel.test.ts`: update the existing server-render regression to
  match the refreshed entries, retaining coverage of the visible card's dated
  primary-source link and all three named headline selectors/selection states.
  No new logic or tests duplicating the article text were added.

## Sources

All sources checked on **2026-11-02**. Publication dates, event dates, and the
access date are distinct below.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | The auction announcement is the newest official news entry. | Index undated; newest entry published 2026-11-02. |
| https://www.thecure.com/news/2026/11/heart-research-auction/ | Robert's artwork contribution to Heart Research UK's anonymous heART project; auction scheduled to close November 8. | Published 2026-11-02; states close at 9pm on Sunday November 8 (2026 context), with no explicit timezone. The card omits the time. |
| https://heartresearch.org.uk/support-us/get-involved/anonymous-heart-project/ | Charity page linked by the announcement; confirms Robert Smith as a 2026 contributor and the auction dates. | Publication date unstated; event October 30–November 8 in its 2026 project context. |
| https://www.thecure.com/news/2026/09/boys-dont-cry-the-music-box/ | Retained music-box announcement, Andy Vella artwork, and proceeds for Doctors Without Borders. | Published 2026-09-18; no future event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site; request returned HTTP 429. | No post or publication/event date verified; no social content used. |

The official news, shows, and charity pages were publicly readable. No Chain of
Flowers URL was found in the application; no fan commentary was used.

## Validation

- `pnpm check` — passed: ESLint, TypeScript, 63 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
  pnpm also installed the locked dependencies and passed supply-chain checks.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
