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

const selection = vi.hoisted(() => ({ era: "wish-rush" }));
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) =>
      react.useState(initial === "wish-rush" ? selection.era : initial),
  };
});

describe("Live Set Snapshot accessibility", () => {
  it.each(["wish-rush", "festival-pop", "marathon-singalong", "lost-world-glow"])(
    "keeps every tab connected to a focusable panel when %s is selected",
    (era) => {
      selection.era = era;
      const html = renderToStaticMarkup(createElement(Home));
      const tablist = html.match(/<div[^>]*role="tablist"[^>]*aria-label="[^"]*live set snapshots"[\s\S]*?<\/div>/)?.[0];
      expect(tablist).toBeDefined();
      const tabs = tablist!.match(/<button[^>]*role="tab"[^>]*>/g)!;
      expect(tabs).toHaveLength(4);
      expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
      expect(tabs.filter((tab) => tab.includes('aria-selected="true"'))).toHaveLength(1);
      for (const tab of tabs) {
        const active = tab.includes(`id="tour-snapshot-tab-${era}"`);
        expect(tab).toContain(`aria-selected="${active}"`);
        expect(tab).toContain(`tabindex="${active ? 0 : -1}"`);
        expect(tab).toContain('aria-controls="tour-snapshot-panel"');
      }
      const panel = html.match(/<div[^>]*id="tour-snapshot-panel"[^>]*>/)?.[0];
      expect(panel).toContain('role="tabpanel"');
      expect(panel).toContain(`aria-labelledby="tour-snapshot-tab-${era}"`);
      expect(panel).toContain('tabindex="0"');
      expect(html.match(/id="tour-snapshot-panel"/g)).toHaveLength(1);
    },
  );
});
