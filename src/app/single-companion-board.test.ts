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

const selection = vi.hoisted(() => ({ format: "seven-inch", companion: "halo" }));
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) => react.useState(
      initial === "seven-inch" ? selection.format : initial === "halo" ? selection.companion : initial,
    ),
  };
});

describe("Single Companion Board accessibility", () => {
  it.each([
    ["seven-inch", "halo", "halo", "Halo", 1],
    ["twelve-inch", "scared-as-you", "scared-as-you", "Scared as You", 3],
    ["cd-single", "strangelove-mix", "strangelove-mix", "Strangelove Mix", 3],
    ["seven-inch", "strangelove-mix", "halo", "Halo", 1],
  ])("exposes the selected track and a reachable panel for %s / %s", (format, companion, active, title, count) => {
    selection.format = format;
    selection.companion = companion;
    const html = renderToStaticMarkup(createElement(Home));
    const tablist = html.match(/<div[^>]*role="tablist"[^>]*aria-label="Single companion tracks"[\s\S]*?<\/div>/)?.[0];
    expect(tablist).toBeDefined();
    expect(tablist).toContain('aria-orientation="vertical"');
    const tabs = tablist!.match(/<button[^>]*role="tab"[^>]*>/g)!;
    expect(tabs).toHaveLength(count);
    expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs.filter((tab) => tab.includes('aria-selected="true"'))).toHaveLength(1);
    for (const tab of tabs) {
      const selected = tab.includes(`id="single-companion-tab-${active}"`);
      expect(tab).toContain(`aria-selected="${selected}"`);
      expect(tab).toContain(`tabindex="${selected ? 0 : -1}"`);
      expect(tab).toContain('aria-controls="single-companion-panel"');
    }
    const panel = html.match(/<div[^>]*id="single-companion-panel"[^>]*>/)?.[0];
    expect(panel).toContain('role="tabpanel"');
    expect(panel).toContain(`aria-labelledby="single-companion-tab-${active}"`);
    expect(panel).toContain('tabindex="0"');
    expect(html.match(/id="single-companion-panel"/g)).toHaveLength(1);
    const content = html.match(/id="single-companion-panel"[\s\S]*?<\/aside>/)?.[0];
    expect(content).toContain(`>${title}</h4>`);
    expect(content).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
