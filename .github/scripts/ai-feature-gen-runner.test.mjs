import test from "node:test";
import assert from "node:assert/strict";

import { existsSync, unlinkSync, writeFileSync } from "node:fs";

import {
  assertProvider,
  classifyOpenAiFallback,
  handleOpenAiFallback,
  normalizeErrorMessage,
  parseProviderError,
  RESPONSE_PATH,
  toPositiveInt,
} from "./ai-feature-gen-runner.mjs";

const withResponseFile = (content, fn) => {
  writeFileSync(RESPONSE_PATH, content);
  try {
    return fn();
  } finally {
    if (existsSync(RESPONSE_PATH)) {
      unlinkSync(RESPONSE_PATH);
    }
  }
};

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
  assert.throws(() => assertProvider("other"), /Unsupported AI provider/);
});

test("parseProviderError reads JSON error payloads", () => {
  withResponseFile(JSON.stringify({ error: { message: "model not found", type: "invalid" } }), () => {
    assert.deepEqual(parseProviderError(), { message: "model not found", type: "invalid" });
  });
});

test("parseProviderError tolerates missing error fields", () => {
  withResponseFile(JSON.stringify({ error: {} }), () => {
    assert.deepEqual(parseProviderError(), { message: "", type: "" });
  });
});

test("classifyOpenAiFallback detects model errors", () => {
  const action = classifyOpenAiFallback(400, "The model does not exist", 1);
  assert.equal(action, "switch-provider");
});

test("parseProviderError falls back for invalid JSON or missing file", () => {
  withResponseFile("not-json", () => {
    assert.deepEqual(parseProviderError(), { message: "not-json", type: "" });
  });
  assert.deepEqual(parseProviderError(), { message: "", type: "" });
});

test("classifyOpenAiFallback detects first-attempt context errors", () => {
  const action = classifyOpenAiFallback(400, "context length exceeded", 1);
  assert.equal(action, "retry-slim");
  const laterAttempt = classifyOpenAiFallback(400, "context length exceeded", 2);
  assert.equal(laterAttempt, "none");
});

test("normalizeErrorMessage truncates long messages", () => {
  const normalized = normalizeErrorMessage(`${"a".repeat(600)} extra   spaces`);
  assert.equal(normalized.length, 500);
});

test("normalizeErrorMessage collapses whitespace to single spaces", () => {
  const collapsed = normalizeErrorMessage("hello   world\twith  tabs");
  assert.equal(collapsed, "hello world with tabs");
});

test("handleOpenAiFallback switches provider on model errors", () => {
  const calls = [];
  const result = handleOpenAiFallback({
    provider: "openai",
    httpCode: 400,
    attempt: 1,
    errorMessage: "model does not exist",
    buildAttemptRequest: (targetProvider) => calls.push(`build:${targetProvider}`),
    buildSlimRequest: (targetProvider) => calls.push(`slim:${targetProvider}`),
    sendRequest: (targetProvider) => {
      calls.push(`send:${targetProvider}`);
      return targetProvider === "copilot" ? 200 : 400;
    },
  });

  assert.deepEqual(calls, ["build:copilot", "send:copilot"]);
  assert.equal(result.providerUsed, "copilot");
  assert.equal(result.httpCode, 200);
  assert.equal(result.usedSlimContext, false);
});

test("handleOpenAiFallback surfaces downstream provider failures", () => {
  const calls = [];
  const result = handleOpenAiFallback({
    provider: "openai",
    httpCode: 400,
    attempt: 1,
    errorMessage: "model does not exist",
    buildAttemptRequest: (targetProvider) => calls.push(`build:${targetProvider}`),
    buildSlimRequest: (targetProvider) => calls.push(`slim:${targetProvider}`),
    sendRequest: (targetProvider) => {
      calls.push(`send:${targetProvider}`);
      return 503;
    },
  });

  assert.deepEqual(calls, ["build:copilot", "send:copilot"]);
  assert.equal(result.providerUsed, "copilot");
  assert.equal(result.httpCode, 503);
  assert.equal(result.usedSlimContext, false);
});

test("handleOpenAiFallback retries slim context on first-attempt context errors", () => {
  const calls = [];
  const result = handleOpenAiFallback({
    provider: "openai",
    httpCode: 400,
    attempt: 1,
    errorMessage: "context length exceeded",
    buildAttemptRequest: (targetProvider) => calls.push(`build:${targetProvider}`),
    buildSlimRequest: (targetProvider) => calls.push(`slim:${targetProvider}`),
    sendRequest: (targetProvider) => {
      calls.push(`send:${targetProvider}`);
      return 200;
    },
  });

  assert.deepEqual(calls, ["slim:openai", "send:openai"]);
  assert.equal(result.providerUsed, "openai");
  assert.equal(result.httpCode, 200);
  assert.equal(result.usedSlimContext, true);
});
