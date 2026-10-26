# fridayiamin.love

A fan site celebrating The Cure's "Friday I'm in Love", with a neon, 90s
alternative-rock collage aesthetic. This is also an experiment in autonomous AI
maintenance: small, sourced improvements arrive through tested pull requests.

## Development

The site uses Next.js 16, React 19, TypeScript, Framer Motion, CSS Modules,
Tone.js, and Vitest. CI uses Node.js 22 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The main page is
`src/app/page.tsx`, with section styles in `src/app/page.module.css`.
`src/app/layout.tsx` loads Chicle, Caveat, Special Elite, Permanent Marker, and
Righteous through `next/font`.

```sh
pnpm check                              # lint, types, tests, production build
pnpm audit --prod --audit-level=high     # production dependency security check
pnpm generate:midi                      # regenerate practice MIDI files
```

Individual checks are available in `package.json`. `pnpm build` exports the
static site to `out/`; this project does not require a Next.js production server.

## Site highlights

- A Friday countdown, weekday forecast, section navigation, and calmer reading mode.
- Song and release history, single-format comparisons, and listening entry points.
- Listening and cover-version matchmakers, a Cure queue quiz, and fan route cards.
- Lyric interpretations and multilingual mood notes without full-song reproduction.
- Playable guitar chord progressions, chord diagrams, and downloadable practice MIDI.
- Video-scene interpretation, live-era comparisons, and curated fan resources.

## Daily AI maintenance

[The daily workflow](.github/workflows/daily-maintenance.yml) runs at **20:00 UTC
every day**: 21:00 in Berlin during winter time and 22:00 during summer time.
GitHub schedules can be delayed. It can also be started manually in Actions.

There is one shared
[maintenance policy](.github/opencode/feature-dev-prompt.md), with short repository
conventions in [AGENTS.md](AGENTS.md). UI changes also use the short
[Friday UI skill](.opencode/skills/friday-ui/SKILL.md). The previous parallel feature generators
are retired; their scripts and regression tests remain for now.

Each run:

1. Continues an unfinished pull request first, using failed check output to repair
   it before starting another feature.
2. Otherwise researches public official news, tour announcements, accessible
   official social posts, and relevant fan resources. Claims need source links;
   publication/event dates are kept separate from the date they were checked.
   Inaccessible sources are reported rather than guessed.
3. Chooses one small improvement with the greatest value: new features such as
   dark mode, an additional UI language, or new pages with shared navigation;
   current content, security,
   accessibility, performance, or meaningful test coverage. New code behavior
   needs tests; content-only updates need source verification.
4. Runs the checks and production dependency audit, with up to three attempts to
   repair failures in the same run.
5. Creates or updates the pull request on `ai/daily-maintenance`, with a description
   of the problem, changes, sources, tests, and any remaining failures.
6. [Independently checks the pull request](.github/workflows/ai-pr-checks.yml) and
   merges only the exact commit that passed validation, then triggers deployment.
   A failed pull request stays open for the next daily repair.

The agent can change application code, content, documentation, ordinary scripts,
and dependency versions. It cannot change its own workflow, automation,
instructions, check commands, test configuration, or release setup. The trusted
runner handles commits and pull requests; the agent does not push to `main`.

### GitHub setup

- Reuse the repository's existing `OPENAI_API_KEY` secret. It is supplied only to
  the AI generation step and must never appear in logs or pull requests.
- `OPENCODE_MODEL` selects the OpenAI model without editing the workflow. The
  default is [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).
  Availability still depends on the API project associated with the key.
- Enable Actions and allow GitHub Actions to create pull requests in repository
  settings. Repository branch rules still apply to automatic merging.
- The workflow token needs repository, pull-request, and Actions permissions for
  the documented workflow. Never place tokens in prompts or committed files.
- Release Please uses the existing `RELEASE_PLEASE_TOKEN` secret.

Pause the experiment by disabling **Daily AI maintenance** in GitHub Actions.
Use its manual trigger to retry a run. To undo a merged change, revert its merge
commit through a normal pull request.

## Releases and deployment

Conventional Commits on `main` feed Release Please, which creates a release pull
request and changelog. Successful automatic maintenance merges explicitly trigger the GitHub Pages
workflow, which builds and deploys `out/`. Publishing a release also triggers
deployment; deployment can be started manually as well.
