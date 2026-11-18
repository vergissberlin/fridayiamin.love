# Daily maintenance — 2026-11-18

## Pull request description

Update Next.js and its matching ESLint configuration from **16.4.3 to 16.4.5**
to resolve the two moderate cache information-disclosure advisories identified
in yesterday's maintenance summary. Today's baseline production audit reproduced
both findings; both advisories identify 16.4.5 as patched. This closes a concrete
security follow-up with a small patch update. The site remains statically exported
for GitHub Pages; this does not claim the deployed static site was exploitable.

The working tree was clean, with no supplied failed CI diagnostics or unfinished
work. Recent summaries and current official news/show listings were reviewed.

## Changed areas and tests

- `package.json`: pin `next` and `eslint-config-next` to 16.4.5.
- `pnpm-lock.yaml`: regenerate the dependency graph, including matching Next.js
  environment, compiler, and ESLint plugin packages. Resolution also deduplicated
  existing compatible transitive packages.
- No application logic changed or new tests were added. Existing behavior tests,
  lint, TypeScript checks, and the production static build verify compatibility;
  before/after production audits verify removal of the reported findings.

## Sources

All sources checked on **2026-11-18**. No news or tour claims were added.

| Source URL | What it supports / access result | Publication / event date |
| --- | --- | --- |
| https://github.com/advisories/GHSA-mfr8-8qww-v76h | Moderate Next.js cache disclosure; 16.4.3 affected, 16.4.5 patched. | Publisher date 2026-11-03; database publication/update 2026-11-16. |
| https://github.com/advisories/GHSA-vc7v-qv4w-wrv8 | Moderate nested-cache disclosure; 16.4.3 affected, 16.4.5 patched. | Publisher date 2026-11-03; database publication/update 2026-11-17. |
| https://www.thecure.com/news/ | Accessible official index; latest entry remains “HEART RESEARCH AUCTION”; provides official social links. | Index undated; latest entry published 2026-11-02. |
| https://www.thecure.com/shows/ | Accessible official page states “No shows currently announced!” | Undated; no upcoming event dates listed. |
| https://www.youtube.com/thecure | Followed the band's official social link; identifies The Cure but exposes only navigation/footer, without readable posts or videos. | No publication/event dates verified. |
| https://www.setlist.fm/stats/songs/the-cure-6bd6b266.html?songid=13d6b9a5 | Verified the fan-contributed resource is linked in `src/app/page.tsx`; fetch returned no readable content. No statistics or commentary used. | No publication/event dates verified. |

No Chain of Flowers URL appears in the site's source links. Package availability
was also confirmed with `pnpm view next@16.4.5 version` and
`pnpm view eslint-config-next@16.4.5 version`.

## Validation

- Baseline `pnpm audit --prod --audit-level=high` — exit **0**, but reported
  **two moderate** vulnerabilities. `pnpm audit --prod --json` identified the
  two advisories above against installed Next.js 16.4.3.
- `pnpm install --lockfile-only` and `pnpm install --frozen-lockfile` — passed;
  the frozen install confirmed the updated lockfile is reproducible.
- `pnpm check` — passed ESLint, TypeScript, **134 application tests**, **23 feature
  automation tests**, **27 maintenance tests**, and the Next.js **16.4.5** static
  production build.
- Final `pnpm audit --prod --audit-level=high` and `pnpm audit --prod` — both
  exit **0**, **No known vulnerabilities found**.
- `pnpm peers check` — reported the existing TypeScript **6.0.3** versus
  typescript-eslint **8.57.2** peer range (`>=4.8.4 <6.0.0`) mismatch. These versions
  are unchanged from the original lockfile; lint and type checking passed.
  Dependency resolution also emitted an ESLint 9.39.5 deprecation notice.
- `git diff --check` — passed.

No required check failures remain. Separate follow-up: align the TypeScript/ESLint
toolchain peer support when compatible releases are available.
