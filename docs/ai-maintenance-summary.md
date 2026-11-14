# Daily maintenance — 2026-11-14

## Pull request description

Add missing behavior coverage for MIDI note delivery and synchronized chord
highlights. Recent maintenance tested asynchronous loading and permission races,
but the player tests never invoked the Tone.Part callback that actually plays
notes and schedules highlights.

Two new tests protect polyphonic playback, audio-time highlight scheduling, and
highlight resets across loops and cached chord jumps. They cover existing correct
behavior; no production bug fix or pre-fix failure is claimed.

Chosen after reviewing the clean working tree and recent MIDI lifecycle and
countdown summaries. No failed CI diagnostics or unfinished work were supplied.
Official news and shows remain unchanged; protecting this untested playback path
is a focused improvement to an existing practice feature.

## Changed areas and tests

- `src/components/chord-midi-player.test.ts`: extend the existing Tone mock to
  capture Part callbacks, synth note commands, and scheduled draw callbacks.
- The polyphony case checks all three voices' pitches, durations, velocities,
  and absolute audio times. It checks that no highlight occurs early and that
  simultaneous voices produce just one scheduled highlight.
- The loop/jump case checks highlight order `0 → 1 → 0`, successive audio draw
  times, and a fresh first-chord highlight after a cached jump without refetching.
- Tests use real React refs/callbacks during server rendering, captured effects,
  and mocked Tone/MIDI requests. Browser and audible playback verification were
  unavailable; these tests verify commands and callbacks, not visual or audible
  quality.

## Sources

All URLs checked on **2026-11-14**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; latest entry remains “HEART RESEARCH AUCTION”; links to official social accounts. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the official social link from the band's site. Response identifies The Cure but exposes only navigation/footer, with no readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed URL in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL appears in the site's source links. Test expectations
come from the existing player's note and highlight behavior, not fan commentary.

## Validation

- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **12 player tests**, including the two new cases.
- `pnpm check` — passed: ESLint, TypeScript, **120 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
