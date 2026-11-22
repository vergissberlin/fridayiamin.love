# Daily maintenance — 2026-11-22

## Pull request description

Add two missing behavior tests for overlapping initial audio-permission requests
in the guitar-practice player. If a visitor selects another chord while the first
permission request is pending, its late approval or rejection must leave the newer
playback running at the selected chord. Existing tests covered obsolete MIDI
fetches and cached-session permissions, but not this initial-permission race.

The working tree was clean, with no supplied failed CI diagnostics or unfinished
work. Recent maintenance summaries and current official news/show listings were
reviewed. The listings are unchanged; this focused test improvement protects the
existing practice interaction against unnecessary fetches or interrupted audio.

## Changed areas and tests

- `src/components/chord-midi-player.test.ts`: defer the first audio-permission
  response, start a newer request at chord index 1, then approve or reject the
  older request. Verify no extra MIDI fetch, synth allocation, transport restart,
  stop/cancel, resource disposal, error logging, or highlight update; the newer
  session retains its playback offset and loop. Unmount must still dispose its
  synth and part exactly once.
- Both cases use mocked audio dependencies and the existing imperative-handle
  harness. They verify async lifecycle behavior, not audible output or real
  browser permission prompts. Production code is unchanged.
- Mutation verification: temporarily removing the post-permission stale-request
  guard made the approval test fail on an extra MIDI fetch. Restoring it and
  temporarily removing the catch guard made the rejection test fail on obsolete
  error logging. Both guards were restored before the full successful checks.

## Sources

All sources checked on **2026-11-22**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; supplies official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

The test expectations come from the local player lifecycle, not external claims.

## Validation

- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **21 player tests**, including both new cases.
- `pnpm exec vitest run src/components/chord-midi-player.test.ts -t 'late initial audio-permission'`
  — run twice with temporary mutations; each run failed its corresponding new
  case as expected (one failed, one passed, 19 skipped). Mutations were restored.
- `pnpm check` — passed ESLint, TypeScript, **139 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities
  found**.
- `git diff --check` — passed.

No unresolved check failures or required repairs remain.
