import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertAllowedChanges, assertMergeStillValid, describePullRequest, validateGitScope } from "./validate-maintenance-pr.mjs";

const head = "a".repeat(40);
const base = "b".repeat(40);
const repository = "owner/friday";
const pullRequest = (overrides = {}) => ({
  number: 12,
  state: "open",
  draft: false,
  head: { sha: head, ref: "ai/daily-maintenance", repo: { full_name: repository } },
  base: { sha: base, ref: "main" },
  ...overrides,
});
const manifest = { scripts: { check: "pnpm test", test: "vitest run" }, dependencies: { next: "16.2.6" } };
const change = (path, status = "M", mode = "100644") => ({ path, status, mode });

test("only an explicitly dispatched same-repository maintenance PR may auto-merge", () => {
  assert.equal(describePullRequest(pullRequest(), repository, true).allow_merge, "true");
  assert.equal(describePullRequest(pullRequest(), repository, false).allow_merge, "false");
  const fork = pullRequest({ head: { sha: head, ref: "ai/daily-maintenance", repo: { full_name: "fork/friday" } } });
  assert.equal(describePullRequest(fork, repository, false).is_maintenance, "false");
  assert.throws(() => describePullRequest(fork, repository, true), /restricted/);
});

test("closed, draft, wrong-base and malformed PRs cannot enter validation", () => {
  for (const override of [{ state: "closed" }, { draft: true }, { base: { ref: "other", sha: base } }, { head: { sha: "bad" } }]) {
    assert.throws(() => describePullRequest(pullRequest(override), repository, true));
  }
});

test("scope accepts dependency fixes with unchanged validation scripts", () => {
  assert.doesNotThrow(() => assertAllowedChanges([change("package.json"), change("pnpm-lock.yaml")], manifest, {
    ...manifest, dependencies: { next: "16.2.7" },
  }));
});

test("scope rejects workflow changes, hidden paths, symlinks and deleted tests", () => {
  for (const entry of [change(".github/workflows/ai-pr-checks.yml"), change("AGENTS.md"), change("src/.env"), change("docs/AGENTS.md"), change("src/CLAUDE.md"), change("src/vitest.config.ts"), change("src/tsconfig.test.json"), change("public/link", "A", "120000"), change("src/example.test.ts", "D")]) {
    assert.throws(() => assertAllowedChanges([entry], manifest, manifest));
  }
});

test("scope prevents replacing or disabling test scripts and package configuration", () => {
  assert.throws(() => assertAllowedChanges([change("package.json")], manifest, { ...manifest, scripts: { test: "true", check: "true" } }), /protected/);
  assert.throws(() => assertAllowedChanges([change("package.json")], manifest, { ...manifest, pnpm: { overrides: {} } }), /protected/);
});

test("behavior changes must include a test discovered by the current Vitest configuration", () => {
  assert.throws(() => assertAllowedChanges([change("src/lib/countdown.ts")], manifest, manifest), /require/);
  assert.throws(() => assertAllowedChanges([change("src/lib/countdown.ts"), change("src/lib/countdown.test.tsx")], manifest, manifest), /require/);
  assert.doesNotThrow(() => assertAllowedChanges([change("src/lib/countdown.ts"), change("src/lib/countdown.test.ts")], manifest, manifest));
  assert.doesNotThrow(() => assertAllowedChanges([change("src/app/page.module.css")], manifest, manifest));
});

test("merge refuses a moved PR head or a changed main after successful checks", () => {
  const expected = { repository, head_sha: head, base_sha: base };
  assert.doesNotThrow(() => assertMergeStillValid(pullRequest(), expected, base));
  assert.throws(() => assertMergeStillValid(pullRequest({ head: { ...pullRequest().head, sha: "c".repeat(40) } }), expected, base), /fresh checks/);
  assert.throws(() => assertMergeStillValid(pullRequest(), expected, "d".repeat(40)), /fresh checks/);
});


test("scope independently bounds files and changed lines", () => {
  assert.throws(() => assertAllowedChanges(Array.from({ length: 17 }, (_, index) => change(`docs/${index}.md`)), manifest, manifest), /16 files/);
  assert.throws(() => assertAllowedChanges([change("README.md")], manifest, manifest, 1201), /1200 lines/);
  assert.doesNotThrow(() => assertAllowedChanges([change("README.md")], manifest, manifest, 1200));
});

function withGitRepository(runTest) {
  const cwd = mkdtempSync(join(tmpdir(), "friday-validation-"));
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const commit = () => { git("add", "."); git("commit", "-m", "test fixture"); return git("rev-parse", "HEAD"); };
  try {
    git("init", "--quiet");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.invalid");
    mkdirSync(join(cwd, "docs"));
    mkdirSync(join(cwd, "public"));
    writeFileSync(join(cwd, "package.json"), JSON.stringify(manifest));
    writeFileSync(join(cwd, "docs/old note.md"), "Original source note.\n");
    const base = commit();
    runTest({ cwd, git, commit, base });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test("git scope parses renamed paths containing spaces and tabs without bypassing policy", () => {
  withGitRepository(({ cwd, commit, base }) => {
    renameSync(join(cwd, "docs/old note.md"), join(cwd, "docs/new\tname.md"));
    const candidate = commit();
    assert.doesNotThrow(() => validateGitScope(base, candidate, { cwd }));
  });
});

test("git scope rejects actual symlinks in the candidate tree", () => {
  withGitRepository(({ cwd, commit, base }) => {
    symlinkSync("../package.json", join(cwd, "public/linked-file"));
    const candidate = commit();
    assert.throws(() => validateGitScope(base, candidate, { cwd }), /linked path/);
  });
});

test("git scope rejects a candidate missing the current base commit", () => {
  withGitRepository(({ cwd, git, commit, base }) => {
    writeFileSync(join(cwd, "docs/candidate.md"), "Candidate.\n");
    const candidate = commit();
    git("checkout", "-b", "updated-main", base);
    writeFileSync(join(cwd, "docs/main.md"), "New main change.\n");
    const updatedBase = commit();
    assert.throws(() => validateGitScope(updatedBase, candidate, { cwd }));
  });
});

test("git scope counts candidate additions before accepting the change size", () => {
  withGitRepository(({ cwd, commit, base }) => {
    writeFileSync(join(cwd, "docs/large.md"), "Line\n".repeat(1201));
    const candidate = commit();
    assert.throws(() => validateGitScope(base, candidate, { cwd }), /1200 lines/);
  });
});
