# fridayiamin.love

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Site Highlights

- `Build Your Friday Cure Queue`: an interactive mood selector that recommends adjacent The Cure songs to follow up `Friday I'm in Love`, with short fan-facing notes and source links.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Nightly AI Feature Pipeline

This repository includes a scheduled GitHub Actions workflow at `.github/workflows/ai-feature-gen.yml`.

- **Schedule**: every day at `20:00 UTC` (`21:00` Europe/Berlin during CET).
- **Cron note**: GitHub Actions cron uses UTC.
- **Purpose**: generate and apply one fan-focused feature improvement around The Cure and "Friday I'm in Love" (for example Spotify embed, fan links, MIDI or guitar tabs section).
- **Providers**: `openai`, `copilot`, `opencode`.
- **Default provider**: scheduled runs use `openai`; manual `workflow_dispatch` runs can pick the provider input.
- **Validation gates**: `pnpm lint`, `pnpm typecheck`, and `pnpm build` must pass before any commit is created.
- **Push behavior**: if changes exist and checks pass, the workflow commits using a Conventional Commit message and pushes to `main`.

### Permissions and Authentication

- Workflow permission `contents: write` is required to commit and push.
- `GITHUB_TOKEN` is used for repository write access and GitHub Models (`provider=copilot`).
- `OPENAI_API_KEY` is required for `provider=openai`.
- `OPENCODE_CLI_CMD` (Repository Secret or Variable) is required for `provider=opencode`. It should contain the full command to run the opencode CLI and print the model output to stdout.

Example `OPENCODE_CLI_CMD`:

```bash
opencode run --input /tmp/feature-request.json
```

### Disable, Pause, or Roll Back

- **Pause nightly runs**: disable the workflow in GitHub Actions UI, or remove/comment the `schedule` trigger.
- **Manual test**: use `workflow_dispatch` from the Actions tab.
- **Roll back changes**: revert the generated commit on `main` like any standard commit rollback.
