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

describe("Friday countdown in fractional-offset time zones", () => {
  it.each([
    { zone: "Asia/Kathmandu", offset: "+05:45", offsetMinutes: -345 },
    { zone: "Australia/Eucla", offset: "+08:45", offsetMinutes: -525 },
    { zone: "America/St_Johns", offset: "-03:30", offsetMinutes: 210 },
  ])("uses local Friday midnight in $zone rather than UTC midnight", ({ zone, offset, offsetMinutes }) => {
    vi.stubEnv("TZ", zone);
    const before = new Date(`2026-11-12T23:59:58${offset}`);
    const midnight = new Date(`2026-11-13T00:00:00${offset}`);
    const after = new Date(`2026-11-13T00:00:00.001${offset}`);
    const originalTimestamp = before.getTime();

    // Ensure these fixtures really distinguish the local and UTC calendars.
    expect(before.getTimezoneOffset()).toBe(offsetMinutes);
    expect(before.getDay()).toBe(4);
    expect(midnight.getDay()).toBe(5);
    expect(before.getUTCDay() !== before.getDay() || midnight.getUTCDay() !== midnight.getDay()).toBe(true);

    expect(getNextFridayCountdown(before)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 2 });
    expect(getNextFridayCountdown(midnight)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(getNextFridayCountdown(after)).toEqual({ days: 6, hours: 23, minutes: 59, seconds: 59 });
    expect(before.getTime()).toBe(originalTimestamp);
  });

  it.each([
    {
      start: "2026-04-04T00:00:00+11:00",
      target: "2026-04-10T00:00:00+10:30",
      expected: { days: 6, hours: 0, minutes: 30, seconds: 0 },
    },
    {
      start: "2026-10-03T00:00:00+10:30",
      target: "2026-10-09T00:00:00+11:00",
      expected: { days: 5, hours: 23, minutes: 30, seconds: 0 },
    },
  ])("handles Lord Howe's half-hour clock change after $start", ({ start, target, expected }) => {
    vi.stubEnv("TZ", "Australia/Lord_Howe");
    const now = new Date(start);
    const friday = new Date(target);

    expect(now.getDay()).toBe(6);
    expect(now.getHours()).toBe(0);
    expect(friday.getDay()).toBe(5);
    expect(friday.getHours()).toBe(0);
    expect(friday.getMinutes()).toBe(0);
    expect(Math.abs(friday.getTimezoneOffset() - now.getTimezoneOffset())).toBe(30);
    expect(getNextFridayCountdown(now)).toEqual(expected);
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
