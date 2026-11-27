import { isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

// Keep section state across explicit renders to exercise the language controls.
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
  lang?: string;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
};

function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

let render: () => ReactNode;
const view = () => { hooks.cursor = 0; return elements(render()); };
const languages = [
  ["en", "English"], ["es", "Español"], ["fr", "Français"],
  ["de", "Deutsch"], ["it", "Italiano"], ["ja", "日本語"],
] as const;

beforeEach(() => {
  hooks.values = [];
  hooks.cursor = 0;
  const section = elements(Home()).find((element) =>
    typeof element.type === "function" && element.type.name === "LyricsMeaningSection",
  )!;
  render = section.type as () => ReactNode;
  hooks.values = [];
});

describe("lyric language identification", () => {
  it("identifies every native-language control independently of the selection", () => {
    for (const [code, label] of languages) {
      const button = view().find((element) => element.type === "button" && element.props.children === label)!;
      expect(button.props.lang).toBe(code);
    }
  });

  it.each(languages)("updates translated passages when selecting %s and returning to English", (code, label) => {
    const initial = view();
    const summary = (nodes: ReturnType<typeof view>) => {
      const heading = nodes.findIndex((element) => element.props.children === "Quick meaning summary");
      return nodes[heading + 1];
    };
    const originalSummary = summary(initial).props.children;
    initial.find((element) => element.type === "button" && element.props.children === label)!.props.onClick!();
    const selected = view();
    expect(summary(selected).props.lang).toBe(code);
    if (code !== "en") expect(summary(selected).props.children).not.toBe(originalSummary);
    expect(selected.find((element) => element.type === "button" && element.props.children === label)!.props["aria-pressed"]).toBe(true);

    const lists = selected.filter((element) => element.type === "ul" &&
      [`${label} Friday mood words`, `${label} postcard mood words`].includes(element.props["aria-label"] ?? ""));
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      // Keep the English accessible list label outside the translated items.
      expect(list.props.lang).toBeUndefined();
      const words = elements(list).filter((element) => element.type === "li");
      expect(words).toHaveLength(3);
      expect(words.every((word) => word.props.lang === code)).toBe(true);
    }
    expect(selected.find((element) => element.props.children === "Quick meaning summary")!.props.lang).toBeUndefined();

    selected.find((element) => element.type === "button" && element.props.children === "English")!.props.onClick!();
    expect(summary(view()).props.lang).toBe("en");
    expect(summary(view()).props.children).toBe(originalSummary);
  });
});
