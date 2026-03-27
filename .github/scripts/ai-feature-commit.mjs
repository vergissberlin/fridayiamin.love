import { execFileSync, execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const MAX_SUBJECT_LENGTH = 72;

export function run(command) {
  execSync(command, { stdio: "inherit" });
}

export function runCapture(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}

/**
 * @param {string} line
 */
export function normalizeConventionalSubject(line) {
  const trimmed = line.replace(/\r/g, "").split("\n")[0]?.trim() ?? "";
  const noQuotes = /[\"'“”‘’``]/.test(trimmed) ? trimmed.replace(/[\"'“”‘’``]+/g, "").trim() : trimmed;
  const compact = noQuotes.replace(/\s+/g, " ");
  return compact.length > MAX_SUBJECT_LENGTH ? `${compact.slice(0, MAX_SUBJECT_LENGTH - 1).trimEnd()}…` : compact;
}

/**
 * @param {string} rawNameList
 */
export function parseChangedFiles(rawNameList) {
  return rawNameList
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

/**
 * Derive a Conventional Commit subject from staged file paths and a diff snippet (English, imperative).
 * @param {{ files: string[]; diffSample: string }} opts
 */
export function buildConventionalCommitSubject(opts) {
  const { files, diffSample } = opts;
  if (files.length === 0) {
    return "chore: update repository";
  }

  const onlyMarkdown = files.every((f) => f.endsWith(".md"));
  const onlyWorkflows = files.every((f) => f.startsWith(".github/workflows/"));
  const hasPage =
    files.includes("src/app/page.tsx") || files.some((f) => f.endsWith("/src/app/page.tsx"));
  const hasPageCss =
    files.includes("src/app/page.module.css") || files.some((f) => f.endsWith("/src/app/page.module.css"));
  const hasWorkflow = files.some((f) => f.startsWith(".github/workflows/"));
  const hasScripts = files.some((f) => f.startsWith(".github/scripts/"));
  const hasPkg = files.some((f) => f === "package.json" || f === "pnpm-lock.yaml" || f === "package-lock.json");

  if (onlyMarkdown) {
    return "docs: update documentation";
  }

  if (onlyWorkflows || (hasWorkflow && !hasPage && !hasPageCss && !hasScripts)) {
    return "ci: update GitHub Actions workflows";
  }

  if (hasScripts && !hasPage && !hasPageCss) {
    return "chore: update AI automation scripts";
  }

  if (hasPkg && !hasPage && !hasPageCss) {
    return "chore: update package metadata or lockfile";
  }

  if (hasPage) {
    // Match "Spotify", identifiers like SpotifyPlayer, embed URLs, etc. (avoid requiring a word boundary after "spotify").
    if (/spotify/i.test(diffSample)) {
      return "feat: improve Spotify section on landing page";
    }
    if (/\bcountdown\b/i.test(diffSample)) {
      return "feat: add Friday countdown to landing page";
    }
    if (/\bconfetti\b/i.test(diffSample) || /\bparty\b/i.test(diffSample) || /\bcelebration\b/i.test(diffSample)) {
      return "feat: add Friday party visuals to landing page";
    }
    if (/\bquiz\b/i.test(diffSample)) {
      return "feat: add interactive fan quiz to landing page";
    }
    if (
      /\blyrics?\b/i.test(diffSample) ||
      /\btranslation\b/i.test(diffSample) ||
      /\blanguage\b/i.test(diffSample)
    ) {
      return "feat: expand lyrics experience on landing page";
    }
    if (hasPageCss) {
      return "feat: enhance landing page content and styles";
    }
    return "feat: enhance Friday I'm in Love landing page";
  }

  if (hasPageCss && !hasPage) {
    return "style: refine landing page styles";
  }

  if (hasWorkflow || hasScripts) {
    return "chore: update automation and workflows";
  }

  return "chore: apply AI-generated updates";
}

/**
 * @param {string} message
 */
function gitCommit(message) {
  execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
}

function gitPush() {
  const branch = process.env.GIT_PUSH_BRANCH?.trim();
  if (branch) {
    execFileSync("git", ["push", "origin", branch], { stdio: "inherit" });
    return;
  }
  execFileSync("git", ["push", "origin", "HEAD"], { stdio: "inherit" });
}

export function main(deps = {}) {
  const runCommand = deps.run ?? run;
  const runCaptureCommand = deps.runCapture ?? runCapture;
  const log = deps.log ?? console.log;

  const status = runCaptureCommand("git status --porcelain");
  if (!status) {
    log("No changes");
    return;
  }

  runCommand('git config user.name "github-actions[bot]"');
  runCommand('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  runCommand("git add .");

  const rawFiles = runCaptureCommand("git diff --cached --name-only");
  const files = parseChangedFiles(rawFiles);
  const diffFull = runCaptureCommand("git diff --cached");
  const diffSample = diffFull.length > 24_000 ? `${diffFull.slice(0, 24_000)}\n` : diffFull;
  const rawSubject = buildConventionalCommitSubject({ files, diffSample });
  const subject = normalizeConventionalSubject(rawSubject);

  log(`Commit subject: ${subject}`);
  gitCommit(subject);
  gitPush();
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
