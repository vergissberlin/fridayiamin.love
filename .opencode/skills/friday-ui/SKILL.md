---
name: friday-ui
description: Use for UI features, new pages, styling, navigation, dark mode, or language controls on fridayiamin.love. Skip content-only, dependency, and non-UI test maintenance.
---

# Friday UI

Design for visitors exploring The Cure's "Friday I'm in Love". Before changing a
screen, inspect its existing components, CSS tokens, and surrounding navigation.
Choose one clear visitor need and keep the change visually coherent.

- Preserve the neon, 90s collage identity. Reuse current colors, fonts, spacing,
  and components; give content a clear hierarchy and enough quiet space to read.
- Make calm or dark modes deliberate, legible choices. Retain visible focus and
  sufficient text/control contrast in every mode.
- Keep mobile layouts usable without horizontal overflow. Check long headings,
  translated labels, empty states, and content at narrow widths.
- Use semantic HTML, meaningful control labels, keyboard access, and visible
  focus. Respect reduced motion; avoid essential information conveyed by color
  or animation alone. Explain form errors next to the affected controls.
- For language controls, label each language clearly, translate complete UI
  flows, and keep document language and accessible names consistent.
- For new App Router pages, provide coherent shared navigation, clear current-page
  context, and a route back. Preserve static-export compatibility.
- Keep visitor copy about music and their choices; implementation details belong
  in contributor documentation. Link to lyrics rather than reproducing the song.

Verify the result in a browser when available: desktop/mobile layout, keyboard
navigation, chosen modes/languages, and new route navigation. Record what was
actually checked and any unavailable browser verification in the maintenance
summary; automated checks alone do not establish visual quality.
