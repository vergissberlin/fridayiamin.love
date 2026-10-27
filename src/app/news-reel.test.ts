import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/components/chord-midi-player", () => ({
  ChordMidiPlayer: () => null,
  CHORD_PROGRESSION_MIDI_IDS: ["verse", "chorus", "bridge"],
}));

describe("News Reel initial render", () => {
  it("pairs the visible official update with its dated primary source", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const reel = html.match(/<section id="cure-news-reel"[\s\S]*?<\/section>/)?.[0];

    expect(reel).toBeDefined();
    const article = reel?.match(/<article[\s\S]*?<\/article>/)?.[0];
    expect(article).toBeDefined();
    expect(article).toContain("2026-09-18");
    expect(article).toContain("The Cure · Official news");
    expect(article).toContain("music box");
    expect(article).toMatch(
      /<a href="https:\/\/www\.thecure\.com\/news\/2026\/09\/boys-dont-cry-the-music-box\/" target="_blank" rel="noopener noreferrer"[^>]*>Read source/,
    );

    // Every refreshed entry must remain reachable via a named headline selector.
    const selectors = reel?.match(/<button[^>]*aria-label="Show headline [^"]*"[^>]*>/g);
    expect(selectors).toHaveLength(3);
    expect(selectors?.[0]).toContain('aria-pressed="true"');
    expect(selectors?.[1]).toContain("This is a past event.");
    expect(selectors?.[1]).toContain('aria-pressed="false"');
    expect(selectors?.[2]).toContain("when checked on October 27, 2026");
    expect(selectors?.[2]).toContain('aria-pressed="false"');
  });
});
