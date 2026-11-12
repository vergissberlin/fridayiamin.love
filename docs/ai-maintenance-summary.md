# Daily maintenance — 2026-11-12

## Pull request description

Fix stale MIDI loads starting audio after leaving a progression or replacing a
pending chord request. Previously, a delayed fetch could create a synth after
unmount, override a newer chord selection, or tear down newer playback when the
old fetch failed. Pending audio-permission requests could also outlive cleanup.

The practice player now invalidates pending work on teardown and checks request
identity after each asynchronous loading step. Only the current request can
start playback, report errors, or finish its loading state. Cleanup resets loading
so a progression change cannot leave the player stuck on “Loading…”.

Chosen after inspecting the clean working tree and recent countdown and tab
maintenance. No failed CI diagnostics or unfinished work were supplied. Official
news is unchanged; this reproducible playback bug offered a useful small fix to
an existing feature.

## Changed areas and tests

- `src/components/chord-midi-player.tsx`: request invalidation for imports,
  audio permission, MIDI fetches, and cached-session audio permission.
- `src/components/chord-midi-player.test.ts`: six behavior regressions covering
  unmount during fetch, overlapping loads completing out of order, stale fetch
  rejection, unmount during initial/cached audio permission, and a current fetch
  failure followed by a successful retry. Assertions check actual playback,
  synth creation/disposal, and chord-highlight callbacks.
- Tests use real React refs/callbacks during server rendering, explicitly invoke
  captured effects/cleanup, and mock MIDI requests and Tone audio. No browser or
  physical audio-device verification was performed; these tests do not establish
  visual or audible quality.

## Sources

All URLs checked on **2026-11-12**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; newest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; newest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link. Response identifies The Cure but exposes only navigation/footer, with no readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in the repository; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL appears among the site's source links. The bug evidence
is the local component behavior and the reproduced regression failures.

## Validation

- Before the fix, `pnpm exec vitest run src/components/chord-midi-player.test.ts`
  failed both initial regressions: unmount still created a synth, and an older
  fetch completing last created a second synth and restarted playback.
- After the fix,
  `pnpm exec vitest run src/components/chord-midi-player.test.ts src/lib/chord-midi-playback.test.ts`
  passed all 13 tests then present; two additional lifecycle cases were
  subsequently included in the full check.
- `pnpm check` — passed: ESLint, TypeScript, **114 application tests**, 23 feature
  automation tests, 27 maintenance tests, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
