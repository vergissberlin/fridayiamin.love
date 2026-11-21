# Daily maintenance — 2026-11-21

## Pull request description

Remove the redundant Google Fonts `@import` from `src/app/globals.css`.
`src/app/layout.tsx` already self-hosts all five fonts through `next/font/google`
and applies their CSS variables to the body. The extra import caused the browser
to fetch a remote stylesheet and an additional Caveat font file despite loading
the bundled fonts. The updated static site uses the same five fonts without those
Google font requests, reducing unnecessary network work and third-party exposure.

The working tree was clean and no failed CI diagnostics or unfinished work were
supplied. Recent maintenance summaries and current official listings were
reviewed. This small performance improvement was chosen because the official
news and show listings remain unchanged and the duplicate request was directly
reproducible.

## Changed areas and verification

- `src/app/globals.css`: remove only the remote font import.
- No application logic changed or permanent tests added for this CSS deletion.
  A temporary Chromium/CDP harness verified the actual production export before
  and after the change, then was removed.
- Baseline: observed requests to `fonts.googleapis.com` and a Caveat `.woff2`
  from `fonts.gstatic.com`, alongside five local font requests. After the fix:
  no Google Fonts requests and five local font requests.
- Browser-reported rendered fonts for probes using each existing CSS variable
  remained Chicle, Caveat, Special Elite, Permanent Marker, and Righteous.
- At **1280px and 390px**, document width stayed within the viewport; Tab reached
  the existing tour link. Reduced motion was enabled. No screenshot comparison
  or full visual/keyboard walkthrough was performed.

## Sources

All sources checked on **2026-11-21**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified this fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |
| https://nextjs.org/docs/app/getting-started/fonts | Official documentation confirms that `next/font/google` self-hosts fonts as static assets without visitor requests to Google. | Documentation last updated 2026-05-27; no event date. |

## Validation

- `pnpm install --frozen-lockfile` — passed; lockfile unchanged.
- `pnpm build` — passed for the baseline browser reproduction.
- `node scripts/check-fonts-temporary.mjs --baseline` and
  `node scripts/check-fonts-temporary.mjs` — passed before/after browser checks
  described above. Initial harness attempts selected a Chromium internal toolbar
  target and failed; selecting the actual page target resolved the harness issue.
  The temporary script was removed after verification.
- `pnpm check` — passed ESLint, TypeScript, **137 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- `pnpm audit --prod --audit-level=high` — exit **0**, **No known vulnerabilities
  found**.
- `git diff --check` — passed.

No unresolved check failures or required repairs remain.
