import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/components/friday-countdown-display", () => import("../components/friday-countdown-display"));
vi.mock("@/app/page.module.css", () => ({ default: {} }));
vi.mock("@/lib/friday-quiz", () => import("../lib/friday-quiz"));
vi.mock("@/lib/tab-keyboard", () => import("../lib/tab-keyboard"));
vi.mock("@/components/chord-midi-player", () => ({
  ChordMidiPlayer: () => null,
  CHORD_PROGRESSION_MIDI_IDS: ["verse", "chorus", "bridge"],
}));

// Render the modern era, whose source links are hidden in the default Wish view.
// Preserve React's state implementation and all unrelated initial state.
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) =>
      react.useState(initial === "wish-rush" ? "lost-world-glow" : initial),
  };
});

describe("Official show navigation", () => {
  it("routes both modern-era sources and the fan resource to the working shows page", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
    const showSources = anchors.filter((anchor) => anchor.includes("Source: Official show updates"));
    const showResource = anchors.filter((anchor) => /<h3[^>]*>Official shows<\/h3>/.test(anchor));

    expect(html).toContain('aria-labelledby="tour-snapshot-tab-lost-world-glow"');
    expect(showSources).toHaveLength(2);
    expect(showResource).toHaveLength(1);
    for (const anchor of [...showSources, ...showResource]) {
      expect(anchor).toContain('href="https://www.thecure.com/shows/"');
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
    expect(anchors.some((anchor) => anchor.includes('href="https://www.thecure.com/tour/"'))).toBe(false);
  });
});
