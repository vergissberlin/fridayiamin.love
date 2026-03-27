import { describe, expect, it } from "vitest";
import { getNextFridayCountdown } from "./friday-countdown";

describe("getNextFridayCountdown", () => {
  it("returns zero when already at Friday midnight", () => {
    const now = new Date(2026, 2, 27, 0, 0, 0, 0);
    const result = getNextFridayCountdown(now);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("counts to the next week when it is Friday after midnight", () => {
    const now = new Date(2026, 2, 27, 12, 30, 40, 0);
    const result = getNextFridayCountdown(now);

    const nextFridayMidnight = new Date(now);
    nextFridayMidnight.setDate(nextFridayMidnight.getDate() + 7);
    nextFridayMidnight.setHours(0, 0, 0, 0);

    const expectedTotalSeconds = Math.floor((nextFridayMidnight.getTime() - now.getTime()) / 1000);
    const totalSecondsFromParts =
      result.days * 86400 + result.hours * 3600 + result.minutes * 60 + result.seconds;

    expect(totalSecondsFromParts).toBe(expectedTotalSeconds);
    expect(result.days).toBeGreaterThanOrEqual(6);
  });

  it("counts down from Thursday night to Friday midnight", () => {
    const now = new Date(2026, 2, 26, 23, 59, 58, 0);
    const result = getNextFridayCountdown(now);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 2,
    });
  });

  it("counts down from Sunday to the coming Friday", () => {
    const now = new Date(2026, 2, 22, 0, 0, 0, 0);
    const result = getNextFridayCountdown(now);

    expect(result).toEqual({
      days: 5,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
