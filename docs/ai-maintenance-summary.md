# Daily maintenance — 2026-11-26

## Pull request description

Fix stale clipboard feedback in the Friday Fan Flyer. Previously, changing the
mood, video texture, or live-era choice left “Flyer text copied.” displayed even
though the new flyer had not been copied. Copy failures also persisted after
editing, and a pending clipboard result could label a different flyer.

Feedback now belongs to the exact text submitted to the clipboard. A different
flyer displays the original copy prompt; copying it reports its own result.
The existing polite live region and retry behavior are preserved.

The working tree was clean, no failed CI diagnostics were supplied, and recent
maintenance summaries were reviewed. Official news and shows listings remain
unchanged. This reproducible sharing fix improves an existing interaction.

## Changed areas and tests

- `src/app/page.tsx`: store the submitted flyer text with the clipboard result;
  show success or failure only when that text matches the current flyer.
- `src/app/fan-flyer-copy.test.ts`: six regression cases exercise the real section
  handlers with retained mock hook state and a mocked clipboard. Cover all three
  choice groups, copying changed text, delayed success/failure after editing,
  and recovery from a failed copy. All six failed before the production fix.
  These tests inspect React elements and explicit renders, not browser DOM events.

## Sources

All sources checked on **2026-11-26**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; supplies official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the official social link; identifies The Cure but returns navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified fan-contributed resource URL in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

Behavior expectations derive from the existing local flyer builder and clipboard
handler. The project-local Friday UI skill was loaded.

## Validation

- `pnpm exec vitest run src/app/fan-flyer-copy.test.ts` before the fix — expected
  failure: **6 failed**, reproducing stale success and failure feedback.
- `pnpm check` after the fix — passed ESLint, TypeScript, **155 application
  tests** (including all six new cases), **23 feature automation tests**,
  **27 maintenance tests**, and the Next.js **16.4.5** static production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities found**.
- `git diff --check` — passed.
- Browser verification was not performed. Chromium is installed, but filesystem
  permissions blocked creation of the temporary browser harness in `/tmp/opencode`.
  No visual, mobile, real-browser keyboard, or clipboard-permission checks claimed.

No unresolved check failures or required repairs remain.
