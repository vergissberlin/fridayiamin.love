import { readFileSync, writeFileSync, existsSync } from "node:fs";

const REQUEST_PATH = "/tmp/feature-request.json";
const RESPONSE_PATH = "/tmp/response.json";
const TARGET_PATH = "src/app/page.tsx";
const isDebug = String(process.env.DEBUG_AI_FEATURE_GEN ?? "").toLowerCase() === "true";
const FULL_CONTEXT_BUDGET = 70_000;
const SLIM_CONTEXT_BUDGET = 25_000;

function debugLog(message) {
  if (isDebug) {
    console.log(`[ai-feature-gen][debug] ${message}`);
  }
}

function trimToBudget(text, budget) {
  if (text.length <= budget) {
    return text;
  }

  const keepStart = Math.floor(budget * 0.7);
  const keepEnd = Math.max(0, budget - keepStart);
  const start = text.slice(0, keepStart);
  const end = text.slice(text.length - keepEnd);
  return `${start}\n\n/* ... truncated for payload size ... */\n\n${end}`;
}

function buildRequest(mode = "full") {
  const promptPath = ".github/copilot/nightly-feature-prompt.md";
  const prompt = readFileSync(promptPath, "utf-8");

  const contextFiles =
    mode === "slim" ? ["src/app/page.tsx"] : ["src/app/page.tsx", "src/app/page.module.css", "README.md"];
  const contextBudget = mode === "slim" ? SLIM_CONTEXT_BUDGET : FULL_CONTEXT_BUDGET;
  const contextParts = [];
  let remainingBudget = contextBudget;

  for (const filePath of contextFiles) {
    if (remainingBudget <= 0) {
      break;
    }

    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      const fileBlock = `--- FILE: ${filePath} ---\n${content}`;
      const trimmedBlock = trimToBudget(fileBlock, remainingBudget);
      contextParts.push(trimmedBlock);
      remainingBudget -= trimmedBlock.length + 2;
    } catch {
      // Skip unreadable files to preserve previous behavior.
    }
  }

  const context = contextParts.join("\n\n");
  const messages = [{ role: "system", content: prompt }];

  if (context) {
    messages.push({
      role: "user",
      content:
        "Here is the current application context. Propose and apply exactly one enhancement as specified.\n\n" +
        context,
    });
  }

  const payload = {
    model: "openai/gpt-4.1",
    messages,
    temperature: 0.4,
    max_tokens: 6000,
  };

  writeFileSync(REQUEST_PATH, JSON.stringify(payload), "utf-8");
  debugLog(
    `Built ${mode} request with ${messages.length} message(s), context files: ${contextParts.length}, context length: ${context.length}`,
  );
}

function applyResponse() {
  const data = JSON.parse(readFileSync(RESPONSE_PATH, "utf-8"));
  const apiError = data?.error;
  if (apiError) {
    const message = typeof apiError?.message === "string" ? apiError.message : JSON.stringify(apiError);
    console.error(`Model API returned an error payload: ${message}`);
    process.exit(1);
  }

  if (!Array.isArray(data?.choices) || data.choices.length === 0) {
    console.error("Model response does not contain any choices.");
    process.exit(1);
  }

  debugLog(`Response contains ${data.choices.length} choice(s)`);

  const rawContent = data?.choices?.[0]?.message?.content ?? "";
  debugLog(`Raw first choice content length: ${rawContent.length}`);

  let content = "";
  const preferredFencePattern = /```(?:tsx|typescript|jsx)\s*([\s\S]*?)```/i;
  const anyFencePattern = /```[a-zA-Z]*\s*([\s\S]*?)```/;

  const preferredFenceMatch = rawContent.match(preferredFencePattern);
  if (preferredFenceMatch) {
    [, content] = preferredFenceMatch;
    debugLog("Detected TSX/TypeScript/JSX fenced code block; extracted inner content.");
  } else {
    const anyFenceMatch = rawContent.match(anyFencePattern);
    if (anyFenceMatch) {
      [, content] = anyFenceMatch;
      debugLog("Detected generic fenced code block; extracted inner content.");
    }
  }

  if (!content.trim()) {
    console.error("Model response does not contain a fenced code block with file content.");
    process.exit(1);
  }

  if (!content.trim()) {
    console.log("Model returned empty content; nothing to do.");
    process.exit(0);
  }

  writeFileSync(TARGET_PATH, content, "utf-8");
  debugLog(`Wrote ${content.length} characters to ${TARGET_PATH}`);
  console.log("Updated files:", TARGET_PATH);
}

const command = process.argv[2];
const arg = process.argv[3];

if (command === "build-request") {
  buildRequest(arg === "slim" ? "slim" : "full");
} else if (command === "apply-response") {
  applyResponse();
} else {
  console.error("Usage: node .github/scripts/ai-feature-gen.mjs <build-request|apply-response> [slim]");
  process.exit(1);
}
