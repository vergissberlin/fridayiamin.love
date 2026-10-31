import { describe, expect, it, vi } from "vitest";
import { handleHorizontalTabKey } from "./tab-keyboard";

function setup(key: string, modifiers = {}) {
  const event = { key, altKey: false, ctrlKey: false, metaKey: false, preventDefault: vi.fn(), ...modifiers };
  const tabs = Array.from({ length: 4 }, () => ({ focus: vi.fn() }));
  const activate = vi.fn();
  return { event, tabs, activate };
}

describe("horizontal tab keyboard navigation", () => {
  it.each([
    ["ArrowRight", 0, 1],
    ["ArrowRight", 3, 0],
    ["ArrowLeft", 2, 1],
    ["ArrowLeft", 0, 3],
    ["Home", 2, 0],
    ["End", 1, 3],
  ])("%s from tab %i activates and focuses tab %i", (key, from, to) => {
    const { event, tabs, activate } = setup(key);
    handleHorizontalTabKey(event, from, tabs, activate);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(activate).toHaveBeenCalledExactlyOnceWith(to);
    tabs.forEach((tab, index) => expect(tab.focus).toHaveBeenCalledTimes(index === to ? 1 : 0));
  });

  it.each(["Tab", "ArrowUp", "ArrowDown", "Enter", " ", "Escape"])("leaves %s to the browser", (key) => {
    const { event, tabs, activate } = setup(key);
    handleHorizontalTabKey(event, 1, tabs, activate);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
    tabs.forEach((tab) => expect(tab.focus).not.toHaveBeenCalled());
  });

  it.each(["altKey", "ctrlKey", "metaKey"])("preserves %s browser shortcuts", (modifier) => {
    const { event, tabs, activate } = setup("ArrowLeft", { [modifier]: true });
    handleHorizontalTabKey(event, 1, tabs, activate);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
  });

  it("ignores an empty tablist", () => {
    const { event, activate } = setup("Home");
    handleHorizontalTabKey(event, 0, [], activate);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
  });
});
