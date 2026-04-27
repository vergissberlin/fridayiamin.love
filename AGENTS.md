# AGENTS.md

## Project Overview

This repository contains the fridayiamin.love website - a vibrant, chaotic celebration of The Cure's iconic song "Friday I'm in Love". The design embodies 90s alternative rock aesthetics with pop-art collage elements and playful surrealism.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Animation**: Framer Motion
- **Styling**: CSS Modules with CSS custom properties

## Build Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Preview production build locally
pnpm preview

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Code Style Guidelines

### General Principles
- Write self-documenting code with clear naming
- Use TypeScript for type safety - avoid `any`
- Prefer functional patterns and immutability
- Keep functions small and focused (single responsibility)
- React components should be "use client" for animations (framer-motion)

### TypeScript
- Use explicit types; avoid `any`
- Use interfaces for object shapes
- Use type aliases for unions and primitives
- Export types that are used across modules

### Naming Conventions
- **Components**: PascalCase (e.g., `HeroSection.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleClick`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_ITEMS`)
- **Files**: kebab-case for utilities (e.g., `api-client.ts`)

### Imports
- Group imports: 1) React/frameworks, 2) external libs, 3) internal modules, 4) types
- Use absolute imports via path aliases (`@/components`)
- Avoid default exports for utilities

### CSS/Styling
- Use CSS Modules for component styles
- Use CSS custom properties for theme values (see `globals.css`)
- Mobile-first responsive design
- Use `clamp()` for fluid typography
- Neon color palette: pink (#ff2d95), cyan (#00f0ff), yellow (#ffee00), purple (#bf00ff)

### Error Handling
- Wrap async operations in try/catch
- Provide user-friendly error messages
- Handle loading and empty states

### Performance
- Optimize images (WebP, lazy loading)
- Minimize bundle size
- Use Framer Motion for performant animations

## Design System

### Colors (CSS Variables)
```css
--pink-neon: #ff2d95
--cyan-neon: #00f0ff
--yellow-neon: #ffee00
--purple-neon: #bf00ff
```

### Fonts
```css
--font-display: 'Chicle' (titles)
--font-handwritten: 'Caveat' (body)
--font-typewriter: 'Special Elite' (monospace)
--font-marker: 'Permanent Marker' (accents)
```

### Animations
- Use Framer Motion for component animations
- CSS keyframes for repeating effects
- Avoid Math.random() in render - use deterministic values

## Git Workflow

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Create feature branches from main
- Keep commits atomic and focused

## AI Workflows

Two separate automations can propose site changes. They are independent (different schedules, triggers, and concurrency groups).

### AI Feature Generator ([`.github/workflows/ai-feature-gen.yml`](.github/workflows/ai-feature-gen.yml))

- **Schedule:** daily at 20:00 UTC (`cron: 0 20 * * *`)
- **Manual:** `workflow_dispatch` with provider choice (`openai`, `copilot`, or `opencode` via `OPENCODE_CLI_CMD`)
- **Behavior:** runs the Node runner in [.github/scripts/ai-feature-gen-runner.mjs](.github/scripts/ai-feature-gen-runner.mjs), validates with `pnpm lint`, `pnpm typecheck`, and `pnpm build`, then commits to the current branch (often `main` when triggered from default branch)
- **Prompt:** [.github/copilot/nightly-feature-prompt.md](.github/copilot/nightly-feature-prompt.md) (full `src/app/page.tsx` output contract for that pipeline)

### OpenCode feature development ([`.github/workflows/opencode-feature.yml`](.github/workflows/opencode-feature.yml))

Uses the official [OpenCode GitHub integration](https://opencode.ai/docs/de/github/) (`anomalyco/opencode/github@latest`) with **OpenAI** (`OPENAI_API_KEY`, model from repo variable `OPENCODE_MODEL`, default `gpt-5.4` → `openai/<model>`).

- **Schedule:** Mondays 09:00 UTC (`cron: 0 9 * * 1`)
- **Manual:** `workflow_dispatch` with optional **Custom prompt** (non-empty input overrides [.github/opencode/feature-dev-prompt.md](.github/opencode/feature-dev-prompt.md))
- **On-demand in GitHub:** comment on an issue or PR (or a PR line review) with **`/oc`** or **`/opencode`** in the body; OpenCode uses the comment as instruction (no file prompt in that case)
- **Behavior:** opens a **feature branch and pull request** (does not push straight to `main`); uses `use_github_token: true` so the default `GITHUB_TOKEN` is used (no OpenCode GitHub App required unless you prefer app-attributed commits later)

## Release Process

Releases are automated using [Release Please](https://github.com/googleapis/release-please-action).

### Conventional Commits Format
Use the following prefixes in commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Release Workflow
1. Commits to `main` branch trigger Release Please
2. Release Please creates/updates a PR with changelog
3. Merging the PR creates the GitHub release
4. Version follows Semantic Versioning based on commits

### Manual Release
Trigger via GitHub Actions `workflow_dispatch` or push to main.

### Required Secret
- `RELEASE_PLEASE_TOKEN` - GitHub Personal Access Token with `repo` scope

## Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation
- Test with screen readers
