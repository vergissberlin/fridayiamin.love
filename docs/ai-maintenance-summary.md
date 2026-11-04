# Daily maintenance — 2026-11-04

## Pull request description

Add harmony regression coverage for the downloadable verse, chorus, and bridge
practice MIDI files. Existing tests verify timing and loop behavior but would
accept incorrect pitches or reordered chords. The new tests decode the actual
public MIDI assets and verify every chord's pitch classes in sequence, including
repeated steps and the bridge's minor chords. Octave/voicing changes remain
possible while missing, extra, or incorrect notes fail the check.

Chosen after reviewing the clean working tree and recent countdown-accessibility,
news-refresh, quiz-test, and queue-keyboard maintenance. No failed CI diagnostics
were supplied; official news and shows still match the recent refresh. Protecting
the existing practice downloads is a small useful test improvement.

## Changed areas and tests

- `src/lib/chord-midi-harmony.test.ts`: three asset-level tests cover the full
  verse, chorus, and bridge sequences, exact triad pitch-class membership, and
  chord-step counts. Expectations are independent of the MIDI generator and
  reflect the site's existing fan-made practice progressions.
- Inspected `src/app/page.tsx` and
  `scripts/generate-friday-chord-midis.mjs` for the existing progression contract.
  No new claim about the original recording is introduced.

## Sources

All public sources checked on **2026-11-04**. No news or tour claims were added.

| Source URL | What it supports | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Official index still lists “HEART RESEARCH AUCTION” as its newest story. | Index undated; newest entry published 2026-11-02. No event date used. |
| https://www.thecure.com/shows/ | Official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://instagram.com/thecure/ | Official social link followed from the band's site; response contained images without readable posts. | No post or publication/event date could be verified; no social content used. |

Official news and shows were publicly readable. No linked Chain of Flowers URL
was found in the repository's application or documentation; the maintenance
instructions only mention the resource by name. No fan commentary was used.

## Validation

- `pnpm exec vitest run src/lib/chord-midi-harmony.test.ts` — passed: all three
  new tests. pnpm installed locked dependencies and passed supply-chain checks.
- `pnpm check` — passed: ESLint, TypeScript, 69 application tests, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved failures or next repair remain.
