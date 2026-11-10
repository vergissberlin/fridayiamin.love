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

const selection = vi.hoisted(() => ({ cover: "david-gray" }));
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) => react.useState(initial === "david-gray" ? selection.cover : initial),
  };
});

describe("Cover version mood tabs", () => {
  it.each([
    ["david-gray", "David Gray"],
    ["himalaya-records", "Himalaya Records"],
    ["billy-rubin-trio", "Billy Rubin Trio"],
    ["nena", "Nena"],
    ["choir-choir-choir", "Choir! Choir! Choir!"],
  ])("exposes one selected tab and a stable, focusable spotlight for %s", (id, artist) => {
    selection.cover = id;
    const html = renderToStaticMarkup(createElement(Home));
    const tablist = html.match(/<div[^>]*role="tablist"[^>]*aria-label="Cover version moods"[\s\S]*?<\/div>/)?.[0];
    expect(tablist).toBeDefined();
    const tabs = tablist!.match(/<button[^>]*role="tab"[^>]*>/g)!;
    expect(tabs).toHaveLength(5);
    expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs.filter((tab) => tab.includes('aria-selected="true"'))).toHaveLength(1);
    for (const tab of tabs) {
      const selected = tab.includes(`id="cover-tab-${id}"`);
      expect(tab).toContain(`aria-selected="${selected}"`);
      expect(tab).toContain(`tabindex="${selected ? 0 : -1}"`);
      expect(tab).toContain('aria-controls="cover-panel"');
    }
    expect(html.match(/id="cover-panel"/g)).toHaveLength(1);
    const panel = html.match(/<aside[^>]*id="cover-panel"[^>]*>[\s\S]*?<\/aside>/)?.[0];
    expect(panel).toContain('role="tabpanel"');
    expect(panel).toContain(`aria-labelledby="cover-tab-${id}"`);
    expect(panel).toContain('tabindex="0"');
    expect(panel).toContain(`>${artist}</h3>`);
    expect(panel).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
