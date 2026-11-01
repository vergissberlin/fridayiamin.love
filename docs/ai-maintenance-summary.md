# Daily maintenance — 2026-11-01

## Pull request description

Add missing behavior coverage for the existing “Which Friday Cure Queue Are You?”
mood quiz. Its scoring and tie-breaking were embedded in the page without tests.
Extract the existing scorer and shared mood type into `src/lib/friday-quiz.ts`,
and keep the page wired to that implementation. Results still use the most
selected mood, with ties resolved in this fixed order: lift-off, twilight,
glitter, afterglow. The page still waits for all four answers before showing a
result.

Chosen after reviewing a clean working tree and recent keyboard-access, MIDI
playback, and dependency maintenance summaries. No failed CI diagnostics were
supplied. Official news/shows match the recent content refresh; regression
coverage for another existing interaction is a useful small improvement.

Changed areas and tests:
- `src/lib/friday-quiz.ts` and `src/app/page.tsx`: move scoring without changing
  the algorithm or UI.
- `src/lib/friday-quiz.test.ts`: 22 cases cover every mood winning unanimously,
  by majority, and by plurality; all six two-way ties in both answer orders;
  a four-way tie answered out of question order; replacing answers, repeated
  scoring, input preservation, unanswered entries, and the reset fallback.
- Existing page-render tests resolve the extracted module using their established
  import-mock pattern.

## Sources

All sources checked on **2026-11-01**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “Boys Don't Cry — The Music Box” as its newest entry. | Index undated; newest entry published 2026-09-18. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site; request returned HTTP 429. | No publication/event date verified; no social content used. |

Official news and shows were publicly readable. No Chain of Flowers link was
found in `src/`; no fan commentary was used. Quiz expectations come from the
existing repository behavior, not external music claims.

## Validation

- `pnpm exec vitest run src/lib/friday-quiz.test.ts` — passed, 22 tests;
  pnpm also installed the locked dependencies and passed supply-chain checks.
- `pnpm check` — passed: ESLint, TypeScript, 63 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
