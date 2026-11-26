import { isValidElement, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

// Retain hook state between explicit renders, and drive the real section's
// handlers without requiring a browser clipboard or a DOM test dependency.
const hooks = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0 }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (value: unknown) => { hooks.values[index] = value; }];
  },
  useRef: () => ({ current: null }),
}));
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  AnimatePresence: "div",
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: () => 0,
}));
vi.mock("@/lib/friday-countdown", () => import("../lib/friday-countdown"));
vi.mock("@/components/friday-countdown-display", () => import("../components/friday-countdown-display"));
vi.mock("@/components/day-progress-display", () => import("../components/day-progress-display"));
vi.mock("@/app/page.module.css", () => ({ default: {} }));
vi.mock("@/lib/friday-quiz", () => import("../lib/friday-quiz"));
vi.mock("@/lib/tab-keyboard", () => import("../lib/tab-keyboard"));
vi.mock("@/lib/visible-clock", () => import("../lib/visible-clock"));
vi.mock("@/components/chord-midi-player", () => ({
  ChordMidiPlayer: () => null,
  CHORD_PROGRESSION_MIDI_IDS: ["verse", "chorus", "bridge"],
}));

type ElementProps = {
  children?: ReactNode;
  onClick?: () => Promise<void> | void;
  "aria-live"?: string;
};

function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

const writeText = vi.fn<(text: string) => Promise<void>>();
let render: () => ReactNode;
const view = () => { hooks.cursor = 0; return elements(render()); };
const status = () => view().find((element) => element.props["aria-live"] === "polite")!.props.children;
const copy = () => view().find((element) => element.props.children === "Copy flyer text")!.props.onClick!();
const changeChoice = (group: number) => {
  const fieldset = view().filter((element) => element.type === "fieldset")[group];
  elements(fieldset).filter((element) => element.type === "button")[1].props.onClick!();
};

beforeEach(() => {
  hooks.values = [];
  hooks.cursor = 0;
  const section = elements(Home()).find((element) =>
    typeof element.type === "function" && element.type.name === "FridayFanFlyerSection",
  )!;
  render = section.type as () => ReactNode;
  hooks.values = [];
  writeText.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
});
afterEach(() => vi.unstubAllGlobals());

describe("Friday fan flyer copy feedback", () => {
  it.each([0, 1, 2])("clears copied feedback when choice group %i changes", async (group) => {
    await copy();
    expect(status()).toBe("Flyer text copied.");
    const originalText = writeText.mock.calls[0][0];
    changeChoice(group);
    expect(status()).toBe("Copy the flyer text for later.");
    await copy();
    expect(writeText.mock.calls[1][0]).not.toBe(originalText);
    expect(status()).toBe("Flyer text copied.");
  });

  it.each([false, true])("does not label a changed flyer with a pending copy result (failure: %s)", async (fail) => {
    let finish!: () => void;
    writeText.mockImplementationOnce(() => new Promise<void>((resolve, reject) => {
      finish = () => fail ? reject(new Error("Permission denied")) : resolve();
    }));
    const pending = copy();
    changeChoice(0);
    finish();
    await pending;
    expect(status()).toBe("Copy the flyer text for later.");
  });

  it("clears a copy failure after editing and allows retrying the new flyer", async () => {
    writeText.mockRejectedValueOnce(new Error("Permission denied"));
    await copy();
    expect(status()).toBe("Copy did not work here, but the flyer links are still ready below.");
    changeChoice(1);
    expect(status()).toBe("Copy the flyer text for later.");
    await copy();
    expect(status()).toBe("Flyer text copied.");
  });
});
