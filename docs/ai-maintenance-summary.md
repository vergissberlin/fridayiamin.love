# Daily maintenance — 2026-11-27

## Pull request description

Identify the language of the existing translated lyric summaries, native-language
selector labels, and standalone phrasebook/postcard mood words. Previously these
all inherited the document's English language, so assistive technology lacked the
information needed to select the appropriate pronunciation. The summary and word
tags now follow the chosen language; each selector identifies its own language.
English headings and accessible list labels retain the document language.

The working tree was clean and no failed CI diagnostics were supplied. Recent
maintenance summaries were reviewed. Official news and shows listings remain
unchanged; this small accessibility improvement benefits the existing six-language
interaction. The project-local Friday UI skill was loaded.

## Changed areas and tests

- `src/app/page.tsx`: add scoped `lang` attributes to the language buttons,
  translated summary, and individual mood words in both lists.
- `src/app/lyric-language.test.ts`: seven regression cases cover native-language
  controls, selection across all six languages, updated summary content and
  language, both word lists, selected-button state, and returning to English.
  English list labels and the summary heading are kept outside translated scopes.
  Tests exercise real handlers with retained mock hook state and inspect React
  elements; they do not simulate browser events or screen-reader speech.

## Sources

All sources checked on **2026-11-27**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the official social link; identifies The Cure but returns navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified fan-contributed resource URL in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |
| https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html | Explains language identification for pronunciation and native-language controls; supports scoped HTML language attributes. | Page states updated 2026-10-04; no event date. |

## Validation

- `pnpm exec vitest run src/app/lyric-language.test.ts` before the fix — expected
  failure: **7 failed**, reproducing missing language attributes.
- `pnpm check` after the fix — passed ESLint, TypeScript, **162 application
  tests** (including all seven new cases), **23 feature automation tests**,
  **27 maintenance tests**, and the Next.js **16.4.5** static production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities found**.
- `git diff --check` — passed.
- Browser verification was not performed: Chromium is installed, but no
  Playwright/Puppeteer package is available and access to the temporary harness
  directory was denied. No visual, mobile, real-browser keyboard, or
  screen-reader pronunciation review is claimed.

No unresolved check failures or required repairs remain.
