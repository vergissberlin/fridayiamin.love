# Daily maintenance — 2026-11-16

## Pull request description

Add missing integration coverage for MIDI chord jumps using the site's actual
downloadable verse, chorus, and bridge files. Earlier tests checked timing helpers,
note delivery, and highlights, but did not check that the player positions the
audio transport correctly or passes the complete timeline to Tone.Part.

Chosen after reviewing a clean working tree and recent maintenance summaries.
No failed CI diagnostics or unfinished work were supplied. Official news and
shows remain unchanged; protecting chord navigation is a focused improvement to
the existing practice feature. These tests cover existing correct behavior.

## Changed areas and tests

- `src/components/chord-midi-player.test.ts`: capture Part events/start arguments
  and allow the existing mount helper to select a progression.
- Three parameterized cases parse the shipped MIDI assets with the real parser,
  while mocking network/audio APIs. Each checks initial playback at step 2,
  cached forward/backward jumps, and clamping beyond either end.
- Assertions cover transport position, loop start/end, tempo, highlighted index,
  absolute Part timing, retained first/last chords after rewinding, the correct
  asset URL, and session reuse without another fetch or synth allocation.
- No browser or audible playback verification was performed; these tests verify
  player commands and data, not sound quality.

## Sources

All URLs checked on **2026-11-16**. No news or tour claims were added to the site.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Public official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/news/2026/11/heart-research-auction/ | Confirms Robert Smith's artwork contribution and the announced auction deadline. | Published 2026-11-02; announced closing date 2026-11-08 at 9pm (timezone unstated). |
| https://www.thecure.com/shows/ | Public official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; response identifies The Cure but exposes only navigation/footer, with no readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL appears in the site's source links. Test expectations
come from the existing player contract and local MIDI assets.

## Validation

- `pnpm install --frozen-lockfile` — passed.
- `pnpm exec vitest run src/components/chord-midi-player.test.ts` — passed all
  **15 player tests**, including the three new progression cases.
- Mutation check: temporarily replaced the player's transport offset with zero.
  `pnpm exec vitest run src/components/chord-midi-player.test.ts -t 'downloadable MIDI timeline'`
  failed all three new cases at the expected transport-position assertion. Restored
  production code before final validation; no production code changes remain.
- `pnpm check` — passed: ESLint, TypeScript, **132 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the static production build.
- `pnpm audit --prod --audit-level=high` — passed: **No known vulnerabilities found**.
- `git diff --check` — passed.

No unresolved validation failures or next repair remain.
