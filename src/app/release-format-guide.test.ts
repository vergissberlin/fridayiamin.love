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

const selection = vi.hoisted(() => ({ format: "seven-inch" }));
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) =>
      react.useState(initial === "seven-inch" ? selection.format : initial),
  };
});

describe("Release Format Guide accessibility", () => {
  it.each([
    ["seven-inch", "7-inch single", 2, 1],
    ["twelve-inch", "12-inch single", 3, 3],
    ["cd-single", "CD single", 4, 3],
  ] as const)("connects every tab to the labelled panel for %s", (format, title, tracks, companions) => {
    selection.format = format;
    const html = renderToStaticMarkup(createElement(Home));
    const tablist = html.match(/<div[^>]*role="tablist"[^>]*aria-label="[^"]*release formats"[\s\S]*?<\/div>/)?.[0];
    expect(tablist).toBeDefined();
    expect(tablist).toContain('aria-orientation="vertical"');
    const tabs = tablist!.match(/<button[^>]*role="tab"[^>]*>/g)!;
    expect(tabs).toHaveLength(3);
    expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs.filter((tab) => tab.includes('aria-selected="true"'))).toHaveLength(1);
    for (const tab of tabs) {
      const active = tab.includes(`id="release-format-tab-${format}"`);
      expect(tab).toContain(`aria-selected="${active}"`);
      expect(tab).toContain(`tabindex="${active ? 0 : -1}"`);
      expect(tab).toContain('aria-controls="release-format-panel"');
    }
    const panel = html.match(/<div[^>]*id="release-format-panel"[^>]*>/)?.[0];
    expect(panel).toContain('role="tabpanel"');
    expect(panel).toContain(`aria-labelledby="release-format-tab-${format}"`);
    expect(panel).toContain('tabindex="0"');
    expect(html.match(/id="release-format-panel"/g)).toHaveLength(1);
    const content = html.match(/id="release-format-panel"[\s\S]*?<\/article>/)?.[0];
    expect(content).toContain(`>${title}</h4>`);
    expect(content!.match(/<li\b/g)).toHaveLength(tracks);
    const companionTabs = html.match(/aria-label="Single companion tracks"[\s\S]*?<\/div>/)?.[0];
    expect(companionTabs!.match(/role="tab"/g)).toHaveLength(companions);
  });
});
