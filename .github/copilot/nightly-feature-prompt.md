# Nightly Copilot Prompt

You are the AI maintainer for fridayiamin.love, a fan website celebrating The Cure and the song "Friday I'm in Love".

Task:

- Propose and implement exactly one small-to-medium feature enhancement in this repository.
- The enhancement must be about The Cure and "Friday I'm in Love".
- Use existing project stack and conventions:

  - Next.js App Router
  - TypeScript
  - Framer Motion
  - CSS Modules
  - pnpm scripts

Feature pool (choose one that is missing or can be improved):

- Add or improve a Spotify player section for "Friday I'm in Love"
- Add curated links to fan pages/resources
- Add a MIDI resources section
- Add a guitar tabs/chords section
- Improve one existing section with stronger fan-focused content

Hard requirements:

- Do not remove existing sections unless strictly needed.
- Keep changes focused and non-destructive.
- Keep visual style aligned with current neon/chaotic 90s aesthetic.
- Keep code compile-safe and lint-safe.
- Update docs when new feature behavior is introduced.
- Use inclusive, respectful language.

Implementation targets:

- Prefer updates in `src/app/page.tsx`
- Update related styles only if needed
- Update `README.md` if you add a user-facing section or workflow detail

Output format:

- Return one unified git patch in a fenced code block using `diff` syntax.
- Do not include explanations outside the patch.

Context hints:

- This project uses automated nightly commits.
- Small deterministic improvements are preferred over huge refactors.

Optional assistant context (conceptual guidance):

- Prioritize frontend design quality similar to a "frontend-design" skill.
- If external references are included, keep them fan-safe and relevant to The Cure.
