import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DayProgressDisplay } from "./day-progress-display";

vi.mock("@/app/page.module.css", () => ({ default: {} }));

function render(now: Date | null) {
  return renderToStaticMarkup(createElement(DayProgressDisplay, { now }));
}

describe("local weekday progress", () => {
  it.each([
    [2, "Monday", "Mon", 1, "14%"],
    [3, "Tuesday", "Tue", 2, "29%"],
    [4, "Wednesday", "Wed", 3, "43%"],
    [5, "Thursday", "Thu", 4, "57%"],
    [6, "Friday", "Fri", 5, "71%"],
    [7, "Saturday", "Sat", 6, "86%"],
    [8, "Sunday", "Sun", 7, "100%"],
  ])("shows %s November as %s in a Monday-first week", (date, day, shortDay, position, width) => {
    const html = render(new Date(2026, 10, date, 12));

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Local weekday"');
    expect(html).toContain('aria-valuemin="0" aria-valuemax="7"');
    expect(html).toContain(`aria-valuenow="${position}"`);
    expect(html).toContain(`aria-valuetext="${day}, day ${position} of 7"`);
    expect(html).toContain(`style="width:${width}"`);
    expect(html).toContain(`aria-current="date">${shortDay}</span>`);
    expect(html.match(/aria-current="date"/g)).toHaveLength(1);
  });

  it("keeps the initial render neutral until the local date is available", () => {
    const html = render(null);

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuetext="Waiting for local date"');
    expect(html).toContain('style="width:0%"');
    expect(html).not.toContain("aria-valuenow");
    expect(html).not.toContain("aria-current");
  });

  it("resets the indicator when local Sunday rolls over to Monday", () => {
    expect(render(new Date(2026, 10, 8, 23, 59, 59))).toContain('aria-valuenow="7"');
    expect(render(new Date(2026, 10, 9))).toContain('aria-valuenow="1"');
  });
});
