import { copyFileSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const REQUEST_PATH = "/tmp/feature-request.json";
export const RESPONSE_PATH = "/tmp/response.json";
const OPENCODE_RAW_PATH = "/tmp/opencode-response.txt";
const LINT_LOG_PATH = "/tmp/ai-feature-lint.log";
const TYPECHECK_LOG_PATH = "/tmp/ai-feature-typecheck.log";
const BUILD_LOG_PATH = "/tmp/ai-feature-build.log";
const PAGE_PATH = "src/app/page.tsx";
const PAGE_BACKUP_PATH = "/tmp/page.tsx.backup";
const ALLOWED_PROVIDERS = new Set(["copilot", "openai", "opencode"]);
const FIRST_ATTEMPT = 1;
const MODEL_ERROR_PATTERN = /model.*(not found|does not exist|unknown|unsupported)/i;
const CONTEXT_ERROR_PATTERN = /(context|token).*(exceeded|length|limit|too (long|large))/i;
const MAX_ERROR_MESSAGE_LENGTH = 500;

function isDebugEnabled() {
  return String(process.env.DEBUG_AI_FEATURE_GEN ?? "").toLowerCase() === "true";
}

function debugLog(message) {
  if (isDebugEnabled()) {
    console.log(`[ai-feature-gen-runner][debug] ${message}`);
  }
}

export function assertProvider(provider) {
  if (!ALLOWED_PROVIDERS.has(provider)) {
    throw new Error(`Unsupported AI provider: ${provider}. Allowed values: copilot, openai, opencode.`);
  }
}

export function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function runNodeScript(...args) {
  execSync(`node ${args.join(" ")}`, { stdio: "inherit" });
}

function requestPayloadSize() {
  if (!existsSync(REQUEST_PATH)) {
    return 0;
  }
  return statSync(REQUEST_PATH).size;
}

function readRequestPayload() {
  return readFileSync(REQUEST_PATH, "utf-8");
}

function writeResponsePayload(payload) {
  writeFileSync(RESPONSE_PATH, payload, "utf-8");
}

function readResponsePayload() {
  try {
    return readFileSync(RESPONSE_PATH, "utf-8");
  } catch {
    return "";
  }
}

function executeHttpRequest({ url, headers, body }) {
  const response = spawnSync(
    "curl",
    ["-sS", "-L", "-X", "POST", url, ...headers.flatMap((h) => ["-H", h]), "-d", body, "-w", "\n%{http_code}"],
    {
      encoding: "utf-8",
    },
  );

  const status = response.status ?? 1;
  if (status !== 0) {
    throw new Error(`curl failed with exit code ${status}: ${response.stderr || "unknown error"}`);
  }

  const stdout = response.stdout || "";
  const splitIndex = stdout.lastIndexOf("\n");
  const rawBody = splitIndex >= 0 ? stdout.slice(0, splitIndex) : "";
  const rawStatus = splitIndex >= 0 ? stdout.slice(splitIndex + 1).trim() : stdout.trim();
  const httpCode = Number.parseInt(rawStatus, 10);

  if (!Number.isFinite(httpCode)) {
    throw new Error(`Unable to parse HTTP code from provider response: "${rawStatus}"`);
  }

  writeResponsePayload(rawBody || "{}");
  return httpCode;
}

export function runProviderRequest(provider) {
  if (provider === "copilot") {
    return executeHttpRequest({
      url: "https://models.github.ai/inference/chat/completions",
      headers: [
        "Content-Type: application/json",
        `Authorization: Bearer ${process.env.GH_TOKEN ?? ""}`,
        "Accept: application/vnd.github+json",
        "X-GitHub-Api-Version: 2022-11-28",
      ],
      body: readRequestPayload(),
    });
  }

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing required secret: OPENAI_API_KEY for provider=openai");
    }
    return executeHttpRequest({
      url: "https://api.openai.com/v1/chat/completions",
      headers: ["Content-Type: application/json", `Authorization: Bearer ${process.env.OPENAI_API_KEY}`],
      body: readRequestPayload(),
    });
  }

  if (!process.env.OPENCODE_CLI_CMD) {
    throw new Error(
      "Missing OPENCODE_CLI_CMD secret/variable for provider=opencode. Example: OPENCODE_CLI_CMD='opencode run --input /tmp/feature-request.json'",
    );
  }

  const opencode = spawnSync(process.env.OPENCODE_CLI_CMD, { shell: true, encoding: "utf-8" });
  if ((opencode.status ?? 1) !== 0) {
    throw new Error(`opencode command failed with exit code ${opencode.status ?? 1}: ${opencode.stderr || "unknown error"}`);
  }

  writeFileSync(OPENCODE_RAW_PATH, opencode.stdout || "", "utf-8");
  runNodeScript(".github/scripts/ai-feature-gen.mjs", "normalize-opencode", OPENCODE_RAW_PATH);
  return 200;
}

export function parseProviderError() {
  const raw = readResponsePayload();
  if (!raw) {
    return { message: "", type: "" };
  }
  try {
    const parsed = JSON.parse(raw);
    const message = parsed?.error?.message ?? "";
    const type = parsed?.error?.type ?? "";
    return { message, type };
  } catch {
    return { message: raw, type: "" };
  }
}

export function classifyOpenAiFallback(httpCode, errorMessage, attempt) {
  if (httpCode !== 400 || !errorMessage) {
    return "none";
  }
  if (MODEL_ERROR_PATTERN.test(errorMessage)) {
    return "switch-provider";
  }
  if (attempt === FIRST_ATTEMPT && CONTEXT_ERROR_PATTERN.test(errorMessage)) {
    return "retry-slim";
  }
  return "none";
}

export function normalizeErrorMessage(message) {
  return String(message ?? "").replace(/\s+/g, " ").slice(0, MAX_ERROR_MESSAGE_LENGTH);
}

export function handleOpenAiFallback({
  provider,
  httpCode,
  attempt,
  errorMessage,
  buildAttemptRequest,
  buildSlimRequest,
  sendRequest,
}) {
  let effectiveProvider = provider;
  let currentHttpCode = httpCode;
  let usedSlimContext = false;

  if (provider !== "openai") {
    return { httpCode: currentHttpCode, providerUsed: effectiveProvider, usedSlimContext };
  }

  const fallbackAction = classifyOpenAiFallback(httpCode, errorMessage, attempt);
  const safeMessage = normalizeErrorMessage(errorMessage);

  if (fallbackAction === "switch-provider") {
    console.log(`OpenAI model error detected ("${safeMessage}"). Retrying with GitHub Models provider...`);
    buildAttemptRequest("copilot");
    currentHttpCode = sendRequest("copilot");
    effectiveProvider = "copilot";
  } else if (fallbackAction === "retry-slim") {
    console.log(`OpenAI context length error detected ("${safeMessage}"). Retrying with slim context...`);
    buildSlimRequest(provider);
    currentHttpCode = sendRequest(provider);
    usedSlimContext = true;
  }

  return { httpCode: currentHttpCode, providerUsed: effectiveProvider, usedSlimContext };
}

function runValidationStep(command, outputPath) {
  const result = spawnSync(command, { shell: true, encoding: "utf-8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  writeFileSync(outputPath, output, "utf-8");
  return result.status ?? 1;
}

/** Best-effort ESLint fixes on the generated page only (imports order, hooks deps, etc.). */
export function runEslintAutofixOnPage() {
  const result = spawnSync('pnpm exec eslint "src/app/page.tsx" --fix', { shell: true, encoding: "utf-8" });
  const out = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (out) {
    console.log(out);
  }
  if ((result.status ?? 1) !== 0) {
    console.log("ESLint --fix still reports issues; full repo lint will capture details.");
  }
}

export function validateGeneratedPage() {
  const lintExit = runValidationStep("pnpm lint", LINT_LOG_PATH);
  const typecheckExit = runValidationStep("pnpm typecheck", TYPECHECK_LOG_PATH);
  const buildExit = runValidationStep("pnpm build", BUILD_LOG_PATH);

  if (lintExit === 0 && typecheckExit === 0 && buildExit === 0) {
    return true;
  }

  console.log(`Validation failed (lint=${lintExit}, typecheck=${typecheckExit}, build=${buildExit})`);
  return false;
}

export function buildRequestForAttempt(attempt, provider) {
  if (attempt === 1) {
    runNodeScript(".github/scripts/ai-feature-gen.mjs", "build-request", "full", provider);
    console.log(`Request payload size (full): ${requestPayloadSize()} bytes`);
    return;
  }

  runNodeScript(
    ".github/scripts/ai-feature-gen.mjs",
    "build-repair-request",
    provider,
    LINT_LOG_PATH,
    TYPECHECK_LOG_PATH,
    BUILD_LOG_PATH,
  );
  console.log(`Request payload size (repair): ${requestPayloadSize()} bytes`);
}

export function generateOrRepair(attempt, provider) {
  buildRequestForAttempt(attempt, provider);
  let httpCode = runProviderRequest(provider);
  const errorInfo = parseProviderError();
  let effectiveProvider = provider;

  const fallbackResult = handleOpenAiFallback({
    provider,
    httpCode,
    attempt,
    errorMessage: errorInfo.message,
    buildAttemptRequest: (targetProvider) => buildRequestForAttempt(attempt, targetProvider),
    buildSlimRequest: (targetProvider) => {
      runNodeScript(".github/scripts/ai-feature-gen.mjs", "build-request", "slim", targetProvider);
      console.log(`Request payload size (slim): ${requestPayloadSize()} bytes`);
    },
    sendRequest: (targetProvider) => runProviderRequest(targetProvider),
  });

  httpCode = fallbackResult.httpCode;
  effectiveProvider = fallbackResult.providerUsed;
  const usedSlimContext = fallbackResult.usedSlimContext;

  // Payload-size handling is provider-agnostic and needs to run even after OpenAI-specific fallbacks.
  const shouldRetrySlimContext =
    httpCode === 413 && effectiveProvider !== "opencode" && attempt === FIRST_ATTEMPT && !usedSlimContext;

  if (shouldRetrySlimContext) {
    console.log("Model API request returned 413 (payload too large), retrying initial request with slim context...");
    runNodeScript(".github/scripts/ai-feature-gen.mjs", "build-request", "slim", effectiveProvider);
    console.log(`Request payload size (slim): ${requestPayloadSize()} bytes`);
    httpCode = runProviderRequest(effectiveProvider);
  }

  if (httpCode < 200 || httpCode >= 300) {
    throw new Error(`Model API request failed with status ${httpCode} (provider=${provider})`);
  }

  debugLog(`Model API request succeeded with status ${httpCode}`);
  runNodeScript(".github/scripts/ai-feature-gen.mjs", "apply-response");
  runEslintAutofixOnPage();
}

function restoreBackupIfPresent() {
  if (existsSync(PAGE_BACKUP_PATH)) {
    copyFileSync(PAGE_BACKUP_PATH, PAGE_PATH);
  }
}

export function main() {
  const provider = String(process.env.AI_PROVIDER ?? "openai");
  const maxAttempts = toPositiveInt(process.env.AI_MAX_REPAIR_ATTEMPTS ?? "3", 3);
  assertProvider(provider);

  console.log(`Using AI provider: ${provider}`);
  console.log(`Max repair attempts: ${maxAttempts}`);

  copyFileSync(PAGE_PATH, PAGE_BACKUP_PATH);
  let success = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`AI generation attempt ${attempt}/${maxAttempts}`);
    generateOrRepair(attempt, provider);

    if (validateGeneratedPage()) {
      console.log(`Validation passed on attempt ${attempt}.`);
      success = true;
      break;
    }

    console.log(`Validation failed on attempt ${attempt}. Preparing repair attempt.`);
  }

  if (!success) {
    console.log("All attempts failed. Restoring previous src/app/page.tsx and skipping commit.");
    restoreBackupIfPresent();
    process.exit(1);
  }
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
