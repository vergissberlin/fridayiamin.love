import test from "node:test";
import assert from "node:assert/strict";

import { main } from "./ai-feature-commit.mjs";

test("commit script exits early when there are no changes", () => {
  const executedCommands = [];
  const logs = [];

  main({
    runCapture: () => "",
    run: (command) => executedCommands.push(command),
    log: (message) => logs.push(message),
  });

  assert.deepEqual(executedCommands, []);
  assert.deepEqual(logs, ["No changes"]);
});

test("commit script runs expected git commands when changes exist", () => {
  const executedCommands = [];

  main({
    runCapture: () => " M src/app/page.tsx",
    run: (command) => executedCommands.push(command),
    log: () => {},
  });

  assert.deepEqual(executedCommands, [
    'git config user.name "github-actions[bot]"',
    'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
    "git add .",
    'git commit -m "feat: add AI-generated Friday I\'m in Love content"',
    "git push origin main",
  ]);
});
