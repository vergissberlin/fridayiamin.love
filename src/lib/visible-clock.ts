/** Refresh immediately while visible, pausing periodic work in background tabs. */
export function startVisibleClock(tick: () => void, intervalMs: number): () => void {
  let interval: ReturnType<typeof setInterval> | undefined;

  const stop = () => {
    clearInterval(interval);
    interval = undefined;
  };

  const syncVisibility = () => {
    stop();
    if (document.visibilityState !== "visible") return;
    tick();
    interval = setInterval(tick, intervalMs);
  };

  document.addEventListener("visibilitychange", syncVisibility);
  syncVisibility();

  return () => {
    stop();
    document.removeEventListener("visibilitychange", syncVisibility);
  };
}
