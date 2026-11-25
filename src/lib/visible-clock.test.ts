import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startVisibleClock } from "./visible-clock";

describe("visible local clocks", () => {
  let page: EventTarget & { visibilityState: DocumentVisibilityState };
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    page = Object.assign(new EventTarget(), { visibilityState: "visible" as DocumentVisibilityState });
    vi.stubGlobal("document", page);
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function setVisibility(state: DocumentVisibilityState) {
    page.visibilityState = state;
    page.dispatchEvent(new Event("visibilitychange"));
  }

  it.each([1000, 60_000])("refreshes immediately and every %i ms while visible", (intervalMs) => {
    const tick = vi.fn();
    dispose = startVisibleClock(tick, intervalMs);
    expect(tick).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(intervalMs - 1);
    expect(tick).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1);
    expect(tick).toHaveBeenCalledTimes(2);
  });

  it("pauses hidden work and immediately reads the current date on return across midnight", () => {
    vi.setSystemTime(new Date("2026-11-26T23:59:59Z"));
    const tick = vi.fn(() => new Date().toISOString());
    dispose = startVisibleClock(tick, 1000);

    setVisibility("hidden");
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(120_000);
    expect(tick).toHaveBeenCalledOnce();

    setVisibility("visible");
    expect(tick).toHaveBeenCalledTimes(2);
    expect(tick).toHaveLastReturnedWith("2026-11-27T00:01:59.000Z");
    vi.advanceTimersByTime(1000);
    expect(tick).toHaveBeenCalledTimes(3);
    expect(tick).toHaveLastReturnedWith("2026-11-27T00:02:00.000Z");
  });

  it("waits for visibility when mounted in a hidden tab", () => {
    page.visibilityState = "hidden";
    const tick = vi.fn();
    dispose = startVisibleClock(tick, 60_000);
    vi.advanceTimersByTime(120_000);
    expect(tick).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);

    setVisibility("visible");
    expect(tick).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(1);
  });

  it("keeps only one interval after repeated visibility events", () => {
    const tick = vi.fn();
    dispose = startVisibleClock(tick, 1000);
    setVisibility("visible");
    setVisibility("hidden");
    setVisibility("hidden");
    setVisibility("visible");
    setVisibility("visible");
    expect(vi.getTimerCount()).toBe(1);

    tick.mockClear();
    vi.advanceTimersByTime(1000);
    expect(tick).toHaveBeenCalledOnce();
  });

  it.each(["visible", "hidden"] as const)("removes timers and listeners on cleanup while %s", (state) => {
    const tick = vi.fn();
    dispose = startVisibleClock(tick, 1000);
    setVisibility(state);
    dispose();
    tick.mockClear();

    setVisibility("hidden");
    setVisibility("visible");
    vi.advanceTimersByTime(120_000);
    expect(tick).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
