# Daily maintenance — 2026-11-23

## Pull request description

Release held practice-player notes when jumping to another chord. Previously,
replacing the MIDI Part and stopping the transport left already-triggered synth
voices sounding for their original note duration, overlapping the selected chord.
Cached jumps now release those voices before restarting, retaining the existing
short envelope tail, synth reuse, selected offset, and loop behavior.

The working tree was clean, with no supplied failed CI diagnostics or unfinished
work. Recent maintenance summaries were reviewed. Official news/show listings
remain unchanged; this reproducible playback fix improves the existing practice
section without expanding the page.

## Changed areas and tests

- `src/components/chord-midi-player.tsx`: release the existing Part's held synth
  voices after stopping the transport and before replacing its schedule.
- `src/components/chord-midi-player.test.ts`: trigger a note, jump to another
  chord, and verify voice release occurs between transport stop and restart.
  Verify initial playback does not release voices, the jump retains its offset
  and highlight, and no extra MIDI fetch or synth allocation/disposal occurs.
  The regression failed before the fix because no release was requested.
- Temporary Chromium/CDP verification of the production export at **1280px and
  390px**, with reduced motion enabled: Tab and Enter reached/activated the second
  chord, its highlight updated, chord controls stayed within the viewport, and no
  horizontal document overflow or player alert appeared.
- An isolated real Tone.js offline-audio comparison used the player's envelope:
  stopping/cancelling the transport at 0.25 seconds left a 1.5-second note sounding
  at 1.0–1.1 seconds (RMS **0.23015**); adding voice release reduced that window to
  **0**. This verifies the audio mechanism, not a listening review of the app.

## Sources

All sources checked on **2026-11-23**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; supplies official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics/commentary used. | No publication/event dates verified. |
| https://tonejs.github.io/docs/15.1.22/classes/PolySynth.html#releaseAll | Version-matched API documents release of active voices. | Undated technical documentation; no event date. |
| https://raw.githubusercontent.com/Tonejs/Tone.js/15.1.22/Tone/instrument/PolySynth.ts | Version-matched implementation confirms ordinary voices are not automatically released on transport stop unless explicitly synced; `releaseAll` triggers their envelopes' release. | Version tag 15.1.22; no publication/event date stated. |

## Validation

- `pnpm exec vitest run src/components/chord-midi-player.test.ts -t 'releases held voices'`
  — expected pre-fix failure: **1 failed, 21 skipped**.
- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **22 player tests** after the fix.
- `pnpm check` — passed ESLint, TypeScript, **140 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities
  found**.
- `node scripts/check-chord-release-temporary.mjs` — passed the browser/audio
  checks above. Initial harness attempts failed on DevTools HTTP polling,
  temporary-profile cleanup, and incomplete Enter-key emulation; these were
  corrected before the successful run. The temporary harness was removed.
- `git diff --check` — passed.

No unresolved check failures or required repairs remain.
