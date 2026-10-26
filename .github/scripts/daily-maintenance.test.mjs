import test from "node:test";
import assert from "node:assert/strict";
import {
  assertAllowedPaths,
  assertPackagePolicy,
  assertTestPolicy,
  buildPullRequestBody,
  failedValidationRunIds,
  hasAgentErrorEvent,
  normalizeModel,
  runRepairLoop,
} from "./daily-maintenance.mjs";

test("scope permits app, research, tests, and dependency maintenance", () => {
  assert.doesNotThrow(() => assertAllowedPaths([
    "src/lib/news.ts", "src/lib/news.test.ts", "docs/ai-research.md",
    "scripts/generate-friday-chord-midis.mjs", "package.json", "pnpm-lock.yaml",
  ]));
});

test("scope rejects workflow edits, hidden files, instructions, and path traversal", () => {
  for (const path of [".github/workflows/deploy.yml", "AGENTS.md", "docs/AGENTS.md", "src/.env", "src/../.github/test", "release-please-config.json", "next.config.ts"]) {
    assert.throws(() => assertAllowedPaths([path]), /protected path/);
  }
});

test("scope bounds the number of changed files", () => {
  assert.throws(() => assertAllowedPaths(Array.from({ length: 17 }, (_, index) => `src/${index}.ts`)), /at most 16/);
});

test("dependency fixes cannot replace CI scripts or add executable package hooks", () => {
  const base = { name: "fan-site", scripts: { test: "vitest run" }, dependencies: { next: "16.2.6" } };
  assert.doesNotThrow(() => assertPackagePolicy(base, { ...base, dependencies: { next: "16.2.7" } }));
  assert.throws(() => assertPackagePolicy(base, { ...base, scripts: { test: "true" } }), /only change package dependencies/);
  assert.throws(() => assertPackagePolicy(base, { ...base, scripts: { ...base.scripts, postinstall: "echo bypass" } }), /only change package dependencies/);
});

test("behavior changes need tests while content and CSS changes can remain focused", () => {
  assert.throws(() => assertTestPolicy(["src/lib/news.ts"], []), /regression test/);
  assert.doesNotThrow(() => assertTestPolicy(["src/lib/news.ts", "src/lib/news.test.ts"], []));
  assert.doesNotThrow(() => assertTestPolicy(["src/app/page.module.css", "docs/news.md"], []));
});

test("existing regression tests cannot be deleted to make checks pass", () => {
  assert.throws(() => assertTestPolicy(["src/lib/news.ts", "src/lib/news.test.ts"], ["src/lib/news.test.ts"]), /cannot delete existing tests/);
});

test("repair loop uses validation feedback and stops after the first successful repair", async () => {
  const requests = [];
  let checks = 0;
  const result = await runRepairLoop({
    generate: async (request) => requests.push(request),
    validate: async () => ++checks === 1
      ? { passed: false, feedback: "Expected news sources to contain a date" }
      : { passed: true, feedback: "All checks passed" },
  });
  assert.deepEqual(requests, [
    { attempt: 1, feedback: "" },
    { attempt: 2, feedback: "Expected news sources to contain a date" },
  ]);
  assert.equal(result.eligible, true);
  assert.equal(result.attempts, 2);
  assert.equal(checks, 2);
});

test("repair loop preserves a failing result after a bounded number of attempts", async () => {
  let calls = 0;
  const result = await runRepairLoop({
    generate: async () => { calls += 1; },
    validate: async () => ({ passed: false, feedback: "Regression test still fails" }),
  });
  assert.equal(calls, 3);
  assert.deepEqual(result, { eligible: false, attempts: 3, feedback: "Regression test still fails" });
});

test("agent failure is repaired without falsely reporting validation success", async () => {
  let validations = 0;
  const requests = [];
  const result = await runRepairLoop({
    attempts: 2,
    generate: async (request) => { requests.push(request); throw new Error("Agent timed out"); },
    validate: async () => { validations += 1; return { passed: true }; },
  });
  assert.equal(validations, 0);
  assert.equal(result.eligible, false);
  assert.equal(requests[1].feedback, "Agent timed out");
});

test("failing pull requests explain repair policy and retain bounded diagnostic details", () => {
  const body = buildPullRequestBody({
    summary: "## Change\nAdd dated official tour sources.", eligible: false, attempts: 3,
    feedback: `Failure with a fence: \`\`\`\n${"x".repeat(60_000)}`, runUrl: "https://github.com/example/site/actions/runs/123",
  });
  assert.match(body, /Failed — do not merge/);
  assert.match(body, /next daily run will repair/);
  assert.match(body, /Add dated official tour sources/);
  assert.ok(body.length < 42_000);
  assert.equal((body.match(/```/g) || []).length, 2);
});

test("passing pull requests still require independent validation", () => {
  const body = buildPullRequestBody({ summary: "Fixed a keyboard trap.", eligible: true, attempts: 1, feedback: "Passed", runUrl: "https://github.com/example/site/actions/runs/123" });
  assert.match(body, /Independent pull request validation must pass/);
});

test("model names accept OpenAI names with or without a provider prefix", () => {
  assert.equal(normalizeModel("gpt-5.4"), "openai/gpt-5.4");
  assert.equal(normalizeModel("openai/gpt-5.4"), "openai/gpt-5.4");
  assert.throws(() => normalizeModel("gpt-5.4 --file secret"), /Invalid/);
});


test("repair feedback follows dispatched validation runs attached to the PR commit", () => {
  const check = { context: "maintenance-validation", state: "failure", target_url: "https://github.com/example/site/actions/runs/123" };
  assert.deepEqual(failedValidationRunIds([
    check, check,
    { ...check, state: "success" },
    { ...check, context: "unrelated" },
    { ...check, target_url: "https://github.com/other/site/actions/runs/456" },
    { ...check, target_url: "https://example.org/example/site/actions/runs/789" },
    { ...check, target_url: "https://github.com/example/site/actions/runs/123/jobs/456" },
  ], "example/site"), ["123"]);
});


test("OpenCode JSON error events fail the attempt even if its exit code is zero", () => {
  assert.equal(hasAgentErrorEvent('{"type":"text","part":{"text":"ok"}}\n'), false);
  assert.equal(hasAgentErrorEvent('banner\n{"type":"error","error":{"message":"failed"}}\n'), true);
  assert.equal(hasAgentErrorEvent('{"type":"session.error"}\n'), true);
});

test("source tests must match the configured Vitest discovery pattern", () => {
  assert.throws(() => assertTestPolicy(["src/lib/news.ts", "src/lib/news.test.tsx"], []), /src\/\*\*\/\*\.test\.ts/);
  assert.doesNotThrow(() => assertTestPolicy(["src/lib/news.ts", "src/lib/news.test.ts"], []));
});
