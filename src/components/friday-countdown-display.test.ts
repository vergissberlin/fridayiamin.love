import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FridayCountdownDisplay } from "./friday-countdown-display";

vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/app/page.module.css", () => ({ default: {} }));

function render(now: Date | null) {
  return renderToStaticMarkup(createElement(FridayCountdownDisplay, { now }));
}

describe("Friday countdown accessibility", () => {
  it("keeps the initial render independent of the server clock", () => {
    expect(render(null)).toBe("");
  });

  it("updates readable time values without a polite or assertive live region", () => {
    for (const seconds of [58, 59]) {
      const html = render(new Date(2026, 10, 5, 23, 59, seconds));
      const timer = html.match(/<div[^>]*role="timer"[^>]*>/)?.[0];

      expect(timer).toBeDefined();
      expect(timer).toContain('aria-label="Countdown to next Friday"');
      expect(timer).toContain('aria-live="off"');
      expect(html).not.toMatch(/aria-live="(?:polite|assertive)"|role="(?:status|alert)"|aria-hidden="true"/);
      expect(html).toContain(`<span>${60 - seconds}</span><small>seconds</small>`);
      for (const unit of ["days", "hours", "minutes"]) {
        expect(html).toContain(`<span>0</span><small>${unit}</small>`);
      }
    }
  });

  it("replaces the timer with a stable Friday celebration status at midnight", () => {
    const midnight = render(new Date(2026, 10, 6));
    const nextTick = render(new Date(2026, 10, 6, 0, 0, 1));

    expect(midnight).toContain('role="status" aria-label="Today is Friday celebration"');
    expect(midnight).toContain("Today is Friday");
    expect(midnight).not.toContain('role="timer"');
    expect(nextTick).toBe(midnight);
  });
});
