import test from "node:test";
import assert from "node:assert/strict";

import { assertProvider, toPositiveInt } from "./ai-feature-gen-runner.mjs";

test("toPositiveInt returns parsed positive integer", () => {
  assert.equal(toPositiveInt("4", 2), 4);
});

test("toPositiveInt falls back for invalid values", () => {
  assert.equal(toPositiveInt("0", 2), 2);
  assert.equal(toPositiveInt("-1", 2), 2);
  assert.equal(toPositiveInt("abc", 2), 2);
});

test("assertProvider accepts supported providers", () => {
  assert.doesNotThrow(() => assertProvider("copilot"));
  assert.doesNotThrow(() => assertProvider("openai"));
  assert.doesNotThrow(() => assertProvider("opencode"));
});

test("assertProvider throws for unsupported provider", () => {
  assert.throws(() => assertProvider("other"));
});
