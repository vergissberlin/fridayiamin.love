import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/components/friday-countdown-display", () => import("../components/friday-countdown-display"));
vi.mock("@/components/day-progress-display", () => import("../components/day-progress-display"));
vi.mock("@/app/page.module.css", () => ({ default: {} }));
vi.mock("@/lib/friday-quiz", () => import("../lib/friday-quiz"));
vi.mock("@/lib/tab-keyboard", () => import("../lib/tab-keyboard"));
vi.mock("@/lib/visible-clock", () => import("../lib/visible-clock"));
vi.mock("@/components/chord-midi-player", () => ({
  ChordMidiPlayer: () => null,
  CHORD_PROGRESSION_MIDI_IDS: ["verse", "chorus", "bridge"],
}));

describe("Chord practice accessibility", () => {
  it("gives repeated chords distinct playback names that retain the visible chord and step", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const section = html.match(/<section id="guitar-tabs"[\s\S]*?<\/section>/)?.[0];
    expect(section).toBeDefined();
    const buttons = [...section!.matchAll(/<button[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
    expect(buttons).toHaveLength(7);
    const names = buttons.map((button) => button[1]);
    expect(new Set(names).size).toBe(buttons.length);
    buttons.forEach(([, name, content], index) => {
      const chord = content.match(/<span[^>]*>([^<]+)<\/span>/)?.[1];
      expect(chord).toBeDefined();
      expect(name).toContain(`chord ${chord}`);
      expect(name).toContain(`step ${index + 1} of ${buttons.length}`);
      expect(name).toMatch(/^Play progression/);
    });
  });
});
