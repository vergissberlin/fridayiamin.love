import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/lib/friday-quiz", () => import("../lib/friday-quiz"));
vi.mock("@/lib/tab-keyboard", () => import("../lib/tab-keyboard"));
vi.mock("@/components/chord-midi-player", () => ({
  ChordMidiPlayer: () => null,
  CHORD_PROGRESSION_MIDI_IDS: ["verse", "chorus", "bridge"],
}));

describe("Friday Cure Queue accessibility", () => {
  it("provides one tab stop and a labelled, keyboard-reachable shared panel", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const queue = html.match(/<section id="friday-cure-queue"[\s\S]*?<\/section>/)?.[0];
    expect(queue).toBeDefined();
    const tabs = queue!.match(/<button[^>]*role="tab"[^>]*>/g)!;
    expect(tabs).toHaveLength(4);
    expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs[0]).toContain('aria-selected="true"');
    expect(tabs[0]).toContain('tabindex="0"');
    for (const tab of tabs.slice(1)) {
      expect(tab).toContain('aria-selected="false"');
      expect(tab).toContain('tabindex="-1"');
    }
    for (const tab of tabs) expect(tab).toContain('aria-controls="queue-panel"');
    const panel = queue!.match(/<section[^>]*role="tabpanel"[^>]*>/)?.[0];
    expect(panel).toContain('id="queue-panel"');
    expect(panel).toContain('aria-labelledby="queue-tab-lift-off"');
    expect(panel).toContain('tabindex="0"');
  });
});
