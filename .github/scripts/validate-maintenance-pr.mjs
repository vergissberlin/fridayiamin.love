import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const MAINTENANCE_BRANCH = "ai/daily-maintenance";
const SHA_PATTERN = /^[a-f0-9]{40}$/;

export function describePullRequest(pr, repository, dispatched) {
  if (pr.state !== "open" || pr.draft) throw new Error("Pull request must be open and ready for review.");
  if (pr.base?.ref !== "main") throw new Error("Only pull requests targeting main are supported.");
  if (!SHA_PATTERN.test(pr.head?.sha ?? "") || !SHA_PATTERN.test(pr.base?.sha ?? "")) {
    throw new Error("Pull request contains an invalid commit SHA.");
  }
  const maintenance = pr.head?.repo?.full_name === repository && pr.head?.ref === MAINTENANCE_BRANCH;
  if (dispatched && !maintenance) throw new Error("Automatic validation dispatch is restricted to the maintenance branch.");
  return {
    pr_number: String(pr.number),
    head_sha: pr.head.sha,
    base_sha: pr.base.sha,
    is_maintenance: String(maintenance),
    allow_merge: String(dispatched && maintenance),
  };
}

export function assertAllowedChanges(changes, basePackage, headPackage, changedLines = 0) {
  if (!changes.length) throw new Error("Maintenance pull request has no changes.");
  if (changes.length > 16) throw new Error("Maintenance may change at most 16 files.");
  if (changedLines > 1200) throw new Error("Maintenance may change at most 1200 lines.");
  for (const { status, path, mode } of changes) {
    const allowed = /^(src|public|scripts|docs)\//.test(path) || ["README.md", "package.json", "pnpm-lock.yaml"].includes(path);
    if (!allowed || path.split("/").some((part) => part.startsWith(".") || /^(AGENTS|CLAUDE)\.md$/i.test(part) || /^(?:(?:vitest|vite|jest|playwright|eslint)\.config\.[^/]+|tsconfig(?:\.[^/]+)?\.json)$/i.test(part)) || mode === "120000" || mode === "160000") {
      throw new Error(`Maintenance cannot change protected or linked path: ${path}`);
    }
    if (status === "D" && /\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) {
      throw new Error(`Maintenance cannot delete a test file: ${path}`);
    }
  }
  const withoutDependencies = ({ dependencies, devDependencies, ...rest }) => rest;
  if (JSON.stringify(withoutDependencies(basePackage)) !== JSON.stringify(withoutDependencies(headPackage))) {
    throw new Error("Maintenance may only change dependency fields in package.json; scripts and configuration are protected.");
  }
  const changesCode = changes.some(({ path }) => /^(src|scripts)\/.*\.[cm]?[jt]sx?$/.test(path) && !/\.(test|spec)\.[cm]?[jt]sx?$/.test(path));
  if (changesCode && !changes.some(({ path, status }) => status !== "D" && /^src\/.*\.test\.ts$/.test(path))) {
    throw new Error("Behavior changes require an added or updated src/**/*.test.ts test.");
  }
}

export function assertMergeStillValid(pr, expected, currentBaseSha) {
  const actual = describePullRequest(pr, expected.repository, true);
  if (actual.head_sha !== expected.head_sha || actual.base_sha !== expected.base_sha || currentBaseSha !== expected.base_sha) {
    throw new Error("Pull request or main changed after validation; fresh checks are required.");
  }
}

function command(program, args, options = {}) {
  return execFileSync(program, args, { encoding: "utf-8", maxBuffer: 8 * 1024 * 1024, ...options }).trim();
}

function api(path) {
  return JSON.parse(command("gh", ["api", path]));
}

function output(values) {
  for (const [name, value] of Object.entries(values)) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

function resolve() {
  const dispatched = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf-8"));
  const number = dispatched ? process.env.PR_NUMBER : event.pull_request?.number;
  if (!/^[1-9]\d*$/.test(String(number))) throw new Error("A valid pull request number is required.");
  const repository = process.env.GITHUB_REPOSITORY;
  const pr = api(`repos/${repository}/pulls/${number}`);
  output(describePullRequest(pr, repository, dispatched));
}

export function validateGitScope(base, head, options = {}) {
  const git = (args) => command("git", args, options);
  if (!SHA_PATTERN.test(base ?? "") || !SHA_PATTERN.test(head ?? "")) throw new Error("Invalid validation SHA.");
  git(["merge-base", "--is-ancestor", base, head]);
  const raw = git(["diff", "--name-status", "--no-renames", "-z", base, head]);
  const fields = raw.split("\0").filter(Boolean);
  const changes = [];
  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index];
    const path = fields[index + 1];
    if (!path) throw new Error("Invalid changed path.");
    const entry = git(["ls-tree", head, "--", path]);
    changes.push({ status, path, mode: entry.split(" ")[0] });
  }
  const readPackage = (sha) => JSON.parse(git(["show", `${sha}:package.json`]));
  const stats = git(["diff", "--numstat", "--no-renames", "-z", base, head]);
  const changedLines = stats.split("\0").reduce((total, entry) => {
    const counts = /^(\d+|-)\t(\d+|-)\t/.exec(entry);
    return total + (Number(counts?.[1]) || 0) + (Number(counts?.[2]) || 0);
  }, 0);
  assertAllowedChanges(changes, readPackage(base), readPackage(head), changedLines);
}

function scope() {
  validateGitScope(process.env.BASE_SHA, process.env.HEAD_SHA);
}

function report() {
  const { GITHUB_REPOSITORY: repository, HEAD_SHA: head, CHECK_RESULT: result } = process.env;
  if (!SHA_PATTERN.test(head ?? "")) throw new Error("Invalid validation SHA.");
  command("gh", ["api", `repos/${repository}/statuses/${head}`, "--method", "POST",
    "-f", `state=${result === "success" ? "success" : "failure"}`,
    "-f", "context=maintenance-validation",
    "-f", `description=${result === "success" ? "All maintenance checks passed" : "Maintenance checks failed; repair required"}`,
    "-f", `target_url=${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`]);
}

function merge() {
  const { GITHUB_REPOSITORY: repository, PR_NUMBER: number, HEAD_SHA: head_sha, BASE_SHA: base_sha } = process.env;
  if (!/^[1-9]\d*$/.test(number ?? "")) throw new Error("Invalid pull request number.");
  const pr = api(`repos/${repository}/pulls/${number}`);
  const currentBase = api(`repos/${repository}/git/ref/heads/main`).object.sha;
  assertMergeStillValid(pr, { repository, head_sha, base_sha }, currentBase);
  command("gh", ["pr", "merge", number, "--repo", repository, "--squash", "--delete-branch", "--match-head-commit", head_sha]);
  const merged = api(`repos/${repository}/pulls/${number}`);
  if (!merged.merged) throw new Error("Merge did not complete; repository rules may require additional checks.");
  // GITHUB_TOKEN merges do not emit push-triggered workflow runs.
  command("gh", ["workflow", "run", "deploy.yml", "--repo", repository, "--ref", "main"]);
  command("gh", ["workflow", "run", "release-please.yml", "--repo", repository, "--ref", "main"]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const action = { resolve, scope, report, merge }[process.argv[2]];
    if (!action) throw new Error("Expected resolve, scope, report, or merge command.");
    action();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
