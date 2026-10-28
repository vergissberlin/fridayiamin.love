import { afterEach, describe, expect, it, vi } from "vitest";
import { getNextFridayCountdown } from "./friday-countdown";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Friday countdown across daylight-saving changes", () => {
  it.each([
    { zone: "Europe/Berlin", start: "2026-03-28T00:00:00+01:00", days: 5, hours: 23 },
    { zone: "Europe/Berlin", start: "2026-10-24T00:00:00+02:00", days: 6, hours: 1 },
    { zone: "America/New_York", start: "2026-03-07T00:00:00-05:00", days: 5, hours: 23 },
    { zone: "America/New_York", start: "2026-10-31T00:00:00-04:00", days: 6, hours: 1 },
    { zone: "Australia/Sydney", start: "2026-10-03T00:00:00+10:00", days: 5, hours: 23 },
    { zone: "Australia/Sydney", start: "2026-04-04T00:00:00+11:00", days: 6, hours: 1 },
  ])("targets local Friday midnight from $start in $zone", ({ zone, start, days, hours }) => {
    vi.stubEnv("TZ", zone);
    const now = new Date(start);

    // Guard the timezone fixture: every case starts at local Saturday midnight.
    expect(now.getDay()).toBe(6);
    expect(now.getHours()).toBe(0);
    expect(getNextFridayCountdown(now)).toEqual({
      days,
      hours,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("Friday countdown at calendar boundaries", () => {
  it.each([
    {
      label: "New Year's Day on a Friday",
      start: "2026-12-31T12:00:00Z",
      expected: { days: 0, hours: 12, minutes: 0, seconds: 0 },
    },
    {
      label: "a leap day before Friday",
      start: "2024-02-28T12:00:00Z",
      expected: { days: 1, hours: 12, minutes: 0, seconds: 0 },
    },
    {
      label: "the final seconds of a leap day",
      start: "2024-02-29T23:59:58Z",
      expected: { days: 0, hours: 0, minutes: 0, seconds: 2 },
    },
    {
      label: "one millisecond after Friday begins",
      start: "2026-10-30T00:00:00.001Z",
      expected: { days: 6, hours: 23, minutes: 59, seconds: 59 },
    },
  ])("handles $label", ({ start, expected }) => {
    vi.stubEnv("TZ", "UTC");

    expect(getNextFridayCountdown(new Date(start))).toEqual(expected);
  });
});
