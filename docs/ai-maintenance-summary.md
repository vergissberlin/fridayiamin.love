# Daily maintenance — 2026-11-15

## Pull request description

Fix the existing week-progress widget: it previously showed 57% (Thursday) on
every day except Friday, which showed 71%. It now follows the visitor's local
weekday through a Monday-first week: 14%, 29%, 43%, 57%, 71%, 86%, 100%.
These are weekday milestones, not a measure of elapsed hours.

The current day is underlined and marked with `aria-current="date"`. A labelled
progressbar exposes the weekday and its position to assistive technology. The
initial render is neutral until the browser supplies the local date. Friday's
yellow styling and sparkle remain; width transitions use the existing CSS and
respect reduced motion. Compact spacing keeps all seven labels inside the widget
at narrow widths.

Chosen after reviewing a clean working tree and recent playback/countdown/tab
maintenance. No failing CI diagnostics or unfinished work were supplied. Official
news and show listings are unchanged; this concrete display bug was a useful,
small improvement to an existing feature.

## Changed areas and tests

- `src/components/day-progress-display.tsx`: extracted deterministic display,
  local weekday mapping, accessible values, and current-day marker.
- `src/app/page.tsx`: retains the existing client-side date and minute refresh;
  delegates rendering to the new display.
- `src/app/page.module.css`: current-day underline and narrow-screen spacing.
- `src/components/day-progress-display.test.ts`: nine cases cover all weekdays,
  matching widths/accessibility values, exactly one current-day marker, neutral
  initial rendering, and Sunday-to-Monday rollover.
- Eight existing page test files resolve the new component alias using their
  established import-mock pattern; their assertions remain intact.

## Sources

All URLs checked on **2026-11-15**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; response identifies The Cure but exposes only navigation/footer, with no readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |
| https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay | Documents local-time weekday values, with Sunday represented by zero. | Last modified 2025-07-10; no event date. |

No Chain of Flowers URL appears in the site's source links.

## Validation

- `pnpm exec vitest run src/components/day-progress-display.test.ts` — all nine
  new cases failed against the extracted original display's missing accessibility
  values; all nine passed after the fix.
- First `pnpm check` exposed unresolved component aliases in eight page suites;
  repaired with the existing test import-mock pattern. Subsequent `pnpm check`
  passed ESLint, TypeScript, **129 application tests**, **23 feature automation
  tests**, **27 maintenance tests**, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `node scripts/check-day-progress-browser.mjs` — temporary Chromium/CDP harness,
  removed after use. Early runs exposed cramped labels at 390px and then 320px;
  adjusted this widget's responsive spacing. Final run passed all seven weekdays
  at 1280px with normal motion and 390px/320px with reduced motion: hydrated local
  values, actual fill widths, underlines, label/container bounds, and reduced CSS
  transition duration. Kathmandu at 00:01 ensured the local weekday differed from
  UTC. No screenshot review or screen-reader speech testing was performed.
- `pnpm build` — passed again after the final responsive CSS adjustment, before
  the successful browser run.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
