import { describe, expect, it } from "vitest";
import { getFridayQuizResult, type FridayQueueMood } from "./friday-quiz";

const moods: FridayQueueMood[] = ["lift-off", "twilight", "glitter", "afterglow"];

function answersFor(choices: FridayQueueMood[]) {
  return Object.fromEntries(choices.map((choice, index) => [`question-${index}`, choice]));
}

describe("Friday mood quiz scoring", () => {
  it.each(moods)("returns %s for unanimous answers", (mood) => {
    expect(getFridayQuizResult(answersFor([mood, mood, mood, mood]))).toBe(mood);
  });

  it.each(moods)("returns %s for a majority even when its first answer comes last", (mood) => {
    const other = moods.find((candidate) => candidate !== mood)!;
    expect(getFridayQuizResult(answersFor([other, mood, mood, mood]))).toBe(mood);
  });

  it.each(moods)("returns %s for a two-answer plurality over two other moods", (mood) => {
    const others = moods.filter((candidate) => candidate !== mood);
    expect(getFridayQuizResult(answersFor([others[0], others[1], mood, mood]))).toBe(mood);
  });

  const ties: [FridayQueueMood, FridayQueueMood, FridayQueueMood][] = [
    ["lift-off", "twilight", "lift-off"],
    ["lift-off", "glitter", "lift-off"],
    ["lift-off", "afterglow", "lift-off"],
    ["twilight", "glitter", "twilight"],
    ["twilight", "afterglow", "twilight"],
    ["glitter", "afterglow", "glitter"],
  ];

  it.each(ties)("breaks a %s / %s tie in favor of %s regardless of answer order", (first, second, expected) => {
    expect(getFridayQuizResult(answersFor([first, second, first, second]))).toBe(expected);
    expect(getFridayQuizResult(answersFor([second, first, second, first]))).toBe(expected);
  });

  it("resolves a four-way tie consistently when questions are answered out of order", () => {
    expect(getFridayQuizResult({
      takeaway: "afterglow",
      scene: "glitter",
      start: "twilight",
      "favorite-detail": "lift-off",
    })).toBe("lift-off");
  });

  it("replaces a previous answer instead of accumulating votes across repeated scoring", () => {
    const answers = {
      start: "twilight",
      scene: "glitter",
      "favorite-detail": "twilight",
      takeaway: "glitter",
    } satisfies Record<string, FridayQueueMood>;
    const original = { ...answers };
    expect(getFridayQuizResult(answers)).toBe("twilight");
    expect(answers).toEqual(original);

    const updated = { ...answers, start: "glitter" as const };
    expect(getFridayQuizResult(updated)).toBe("glitter");
    expect(getFridayQuizResult(answers)).toBe("twilight");
  });

  it("ignores unanswered entries when scoring partial answers", () => {
    expect(getFridayQuizResult({ start: undefined, scene: "afterglow" })).toBe("afterglow");
  });

  it("uses the deterministic fallback after answers are reset", () => {
    expect(getFridayQuizResult({ takeaway: "afterglow" })).toBe("afterglow");
    expect(getFridayQuizResult({})).toBe("lift-off");
  });
});
