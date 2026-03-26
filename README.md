This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Nightly Copilot Feature Pipeline

This repository includes a scheduled GitHub Actions workflow at `.github/workflows/nightly-copilot-feature.yml`.

- **Schedule**: every day at 21:00 Europe/Berlin.
- **Cron note**: GitHub Actions cron uses UTC. The workflow includes both `19:00 UTC` (CEST) and `20:00 UTC` (CET) to stay aligned with Berlin evening runs across daylight saving changes.
- **Purpose**: run GitHub Copilot CLI to propose and apply one fan-focused feature improvement around The Cure and "Friday I'm in Love" (for example Spotify embed, fan links, MIDI or guitar tabs section).
- **Validation gates**: `pnpm lint`, `pnpm typecheck`, and `pnpm build` must pass before any commit is created.
- **Push behavior**: if changes exist and checks pass, the workflow commits using a Conventional Commit message and pushes to `main`.

### Permissions and Authentication

- Workflow permission `contents: write` is required to commit and push.
- `GITHUB_TOKEN` is used for repository write access and Copilot CLI authentication in the workflow environment.

### Disable, Pause, or Roll Back

- **Pause nightly runs**: disable the workflow in GitHub Actions UI, or remove/comment the `schedule` trigger.
- **Manual test**: use `workflow_dispatch` from the Actions tab.
- **Roll back changes**: revert the generated commit on `main` like any standard commit rollback.
# Test
