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

describe("Video Scene Decoder accessibility", () => {
  it("exposes vertical tabs controlling one labelled, keyboard-reachable panel", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const decoder = html.match(/<section id="video-scene-decoder"[\s\S]*?<\/section>/)?.[0];
    expect(decoder).toBeDefined();
    expect(decoder).toMatch(/role="tablist"[^>]*aria-orientation="vertical"/);
    const tabs = decoder!.match(/<button[^>]*role="tab"[^>]*>/g)!;
    expect(tabs.length).toBeGreaterThan(1);
    expect(tabs.filter((tab) => tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs[0]).toContain('aria-selected="true"');
    for (const tab of tabs.slice(1)) {
      expect(tab).toContain('aria-selected="false"');
      expect(tab).toContain('tabindex="-1"');
    }
    for (const tab of tabs) expect(tab).toContain('aria-controls="video-scene-panel"');
    const panel = decoder!.match(/<div[^>]*role="tabpanel"[^>]*>/)?.[0];
    expect(panel).toContain('id="video-scene-panel"');
    expect(panel).toContain(`aria-labelledby="${tabs[0].match(/ id="([^"]+)"/)![1]}"`);
    expect(panel).toContain('tabindex="0"');
  });
});
