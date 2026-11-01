export type FridayQueueMood = "lift-off" | "twilight" | "glitter" | "afterglow";

const FRIDAY_QUIZ_RESULT_ORDER: FridayQueueMood[] = ["lift-off", "twilight", "glitter", "afterglow"];

/** Most answers wins; ties use the fixed mood order, not answer insertion order. */
export function getFridayQuizResult(answers: Partial<Record<string, FridayQueueMood>>): FridayQueueMood {
  const scorecard: Record<FridayQueueMood, number> = {
    "lift-off": 0,
    twilight: 0,
    glitter: 0,
    afterglow: 0,
  };

  Object.values(answers).forEach((answer) => {
    if (answer) {
      scorecard[answer] += 1;
    }
  });

  return FRIDAY_QUIZ_RESULT_ORDER.reduce((bestMood, mood) =>
    scorecard[mood] > scorecard[bestMood] ? mood : bestMood,
  );
}
