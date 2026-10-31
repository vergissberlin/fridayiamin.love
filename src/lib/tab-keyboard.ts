type TabKeyEvent = Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey" | "preventDefault">;

/** Automatic activation for a horizontal tablist; leave Tab and vertical scrolling alone. */
export function handleHorizontalTabKey(
  event: TabKeyEvent,
  currentIndex: number,
  tabs: readonly { focus: () => void }[],
  activateTab: (index: number) => void,
): void {
  if (event.altKey || event.ctrlKey || event.metaKey || tabs.length === 0) return;

  let nextIndex: number;
  switch (event.key) {
    case "ArrowRight":
      nextIndex = (currentIndex + 1) % tabs.length;
      break;
    case "ArrowLeft":
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  activateTab(nextIndex);
  tabs[nextIndex].focus();
}
