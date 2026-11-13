# Daily maintenance — 2026-11-13

## Pull request description

Fix request ordering and error recovery when visitors jump between chord cards
in an already-loaded MIDI practice session. Previously, overlapping audio-unlock
requests could finish out of order and jump back to an older selection. A rejected
unlock also escaped as an unhandled promise rejection instead of using the
player's existing error-and-retry flow.

Cached jumps now each receive a request identity. Only the latest active request
can restart playback or handle a failure. Current failures display the existing
error message and dispose playback so visitors can retry; obsolete failures are
ignored, including after unmount.

Chosen after reviewing the clean working tree and recent MIDI lifecycle,
countdown, and keyboard-tab maintenance. No failed CI diagnostics or unfinished
work were supplied. Official news and show listings are unchanged; this
reproducible gap complements the previous fix for pending MIDI fetches.

## Changed areas and tests

- `src/components/chord-midi-player.tsx`: identity checks and guarded error
  handling for the cached-session audio-unlock path.
- `src/components/chord-midi-player.test.ts`: four regression cases cover
  out-of-order cached jumps, current permission rejection followed by a successful
  fresh retry, and obsolete rejection after either a newer jump or unmount.
  Assertions cover actual transport starts, chord-highlight callbacks, synth
  disposal, fetch reuse/retry, and failure logging.
- Tests use real React refs/callbacks during server rendering, captured effects,
  and mocked Tone/MIDI requests. Browser, rendered error-state, and audible
  playback verification were not performed; no browser tool is available in this
  run. These tests do not establish visual or audible quality.

## Sources

All URLs checked on **2026-11-13**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; latest entry remains “HEART RESEARCH AUCTION”; links to official social accounts. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the official social link from the band's site. Response identifies The Cure but exposes only navigation/footer, with no readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed URL in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL was found in the site's source links. Bug evidence comes
from the local component and the reproduced behavior regression.

## Validation

- Before the fix, `pnpm exec vitest run src/components/chord-midi-player.test.ts`
  failed the new ordering regression: the stale request started transport a third
  time rather than preserving the latest jump (six existing tests passed).
- After the fix, the same command passed all **10 player tests**.
- `pnpm check` — passed: ESLint, TypeScript, **118 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
