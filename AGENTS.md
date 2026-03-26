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

## Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation
- Test with screen readers
