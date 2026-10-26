# Repository guide

## Project

`fridayiamin.love` celebrates The Cure's "Friday I'm in Love" with a neon,
90s alternative-rock collage design. It uses Next.js App Router, React,
TypeScript, Framer Motion, and CSS Modules. The site is statically exported
into `out/` and deployed to GitHub Pages.

## Useful files

- `src/app/page.tsx`: page sections, content, and interactions.
- `src/app/page.module.css`: section styles; `src/app/globals.css`: shared tokens.
- `src/app/layout.tsx`: metadata and fonts.
- `src/components/chord-midi-player.tsx`: practice playback using Tone.js.
- `src/lib/`: extracted logic and Vitest tests.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm audit --prod --audit-level=high
```

`pnpm check` runs lint, TypeScript, app tests, automation tests, and the production
build. Individual commands are in `package.json`. `pnpm build` produces the static
site; `pnpm generate:midi` regenerates the practice MIDI files.

## Conventions

- Keep changes small and focused. Preserve existing features and the design.
- Add App Router pages when useful; keep navigation coherent and static export
  compatibility. The project is not restricted to a single page.
- Use typed, readable code without `any`; prefer `@/` imports and CSS Modules.
- Reuse CSS variables and existing components. Use PascalCase for components,
  camelCase for functions, and kebab-case for utility files.
- Keep the initial render deterministic: no browser-only state, current time,
  or randomness that would cause hydration mismatches.
- Use semantic HTML, keyboard-operable controls, and reduced-motion support.
- Add meaningful behavior or regression tests for changed logic; never weaken
  checks to make a failing change pass.
- Use English documentation and Conventional Commits (`feat:`, `fix:`, etc.).

For UI work, use the focused [Friday UI skill](.opencode/skills/friday-ui/SKILL.md).

## Autonomous maintenance

The single maintenance policy is
[`.github/opencode/feature-dev-prompt.md`](.github/opencode/feature-dev-prompt.md).
The daily workflow manages branches, pull requests, repair attempts, and merge
checks. Agents edit files and report results; they do not push directly to `main`.

Releases use Release Please. Successful automatic maintenance merges and
published releases trigger GitHub Pages deployment.
