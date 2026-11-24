# Daily maintenance — 2026-11-24

## Pull request description

Add missing regression coverage for queued practice-player chord highlights.
Audio events can schedule a highlight before its animation frame runs. Jumping
to another chord or unmounting must cancel that pending frame, otherwise an old
highlight can overwrite the selected chord or arrive after cleanup.

The working tree was clean, with no supplied failed CI diagnostics or unfinished
work. Recent maintenance summaries and current official listings were reviewed.
The listings remain unchanged; these tests protect an existing interaction and
its cleanup. Production behavior is unchanged.

## Changed areas and tests

- `src/components/chord-midi-player.test.ts`: expose the mocked Draw cancellation
  method and model queued frame callbacks. Two cases queue a chord-0 highlight,
  then jump to chord 1 or unmount. Flushing frames must not deliver stale updates;
  the selected highlight or cleared state is retained. The jump case also verifies
  the new Part can schedule and deliver highlights without another fetch or synth.
- Reset the Draw mock implementations after each test to isolate the frame queue.
- Mutation verification: temporarily removing both production Draw cancellation
  calls made both new cases fail on an unexpected chord-0 callback. Both calls
  were restored before the successful full checks. These are mocked lifecycle
  tests, not a browser rendering or audible-output review.

## Sources

All sources checked on **2026-11-24**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but returns navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified the fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

Test expectations come from the local player's existing scheduling and cleanup.

## Validation

- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **24 player tests**.
- `pnpm exec vitest run src/components/chord-midi-player.test.ts -t 'cancels queued chord highlights'`
  — expected mutation failure: **2 failed, 22 skipped**, each delivering a stale
  chord-0 callback. Temporary production mutations were restored.
- `pnpm check` — passed ESLint, TypeScript, **142 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved check failures or required repairs remain.
