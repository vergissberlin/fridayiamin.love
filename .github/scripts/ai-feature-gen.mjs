import { readFileSync, writeFileSync, existsSync } from "node:fs";

const REQUEST_PATH = "/tmp/feature-request.json";
const RESPONSE_PATH = "/tmp/response.json";
const TARGET_PATH = "src/app/page.tsx";
const isDebug = String(process.env.DEBUG_AI_FEATURE_GEN ?? "").toLowerCase() === "true";
const FULL_CONTEXT_BUDGET = 70_000;
const SLIM_CONTEXT_BUDGET = 25_000;
const REPAIR_LOG_BUDGET = 20_000;

function resolveMaxOutputTokens() {
  const raw = process.env.AI_MAX_OUTPUT_TOKENS;
  if (raw) {
    const parsed = Number.parseInt(String(raw), 10);
    if (Number.isFinite(parsed) && parsed >= 1024 && parsed <= 32768) {
      return parsed;
    }
  }
  // Default must fit a full `page.tsx` plus edits; 6000 was too tight and caused truncated output → lint/tsc failures.
  return 16_384;
}

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

function resolveModel(provider) {
  if (provider === "openai") {
    return process.env.OPENAI_MODEL ?? "gpt-5.4";
  }
  if (provider === "opencode") {
    return process.env.OPENCODE_MODEL ?? "gpt-5.4";
  }
  return process.env.GITHUB_MODELS_MODEL ?? "openai/gpt-5.4";
}

function resolveTokenLimitPayload(provider) {
  const maxOutputTokens = resolveMaxOutputTokens();
  if (provider === "openai") {
    return { max_completion_tokens: maxOutputTokens };
  }
  return { max_tokens: maxOutputTokens };
}

function collectContext(mode = "full") {
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

  return contextParts.join("\n\n");
}

function buildRequest(mode = "full", provider = "copilot") {
  const promptPath = ".github/copilot/nightly-feature-prompt.md";
  const prompt = readFileSync(promptPath, "utf-8");
  const context = collectContext(mode);
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
    model: resolveModel(provider),
    messages,
    temperature: 0.4,
    ...resolveTokenLimitPayload(provider),
  };

  writeFileSync(REQUEST_PATH, JSON.stringify(payload), "utf-8");
  debugLog(
    `Built ${mode} request for provider=${provider} with ${messages.length} message(s), context length: ${context.length}`,
  );
}

function readIfExists(path) {
  if (!path) {
    return "";
  }
  if (!existsSync(path)) {
    return "";
  }
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

function buildRepairRequest(provider = "copilot", lintPath = "", typecheckPath = "", buildPath = "") {
  const promptPath = ".github/copilot/nightly-feature-prompt.md";
  const prompt = readFileSync(promptPath, "utf-8");
  const currentPage = readIfExists(TARGET_PATH);
  const lintLog = trimToBudget(readIfExists(lintPath), REPAIR_LOG_BUDGET);
  const typecheckLog = trimToBudget(readIfExists(typecheckPath), REPAIR_LOG_BUDGET);
  const buildLog = trimToBudget(readIfExists(buildPath), REPAIR_LOG_BUDGET);

  const diagnostics = [
    `--- LINT OUTPUT ---\n${lintLog || "No lint output captured."}`,
    `--- TYPECHECK OUTPUT ---\n${typecheckLog || "No typecheck output captured."}`,
    `--- BUILD OUTPUT ---\n${buildLog || "No build output captured."}`,
  ].join("\n\n");

  const repairInstruction = [
    "Repair mode: the previous AI-generated file failed project validation.",
    "Your task is to fix only the issues that block lint/typecheck/build while keeping the intended feature intact.",
    "Do not introduce new sections unless required to fix the errors.",
    "Keep existing behavior and styling direction; apply minimal, deterministic edits.",
    "Return the full updated source code for src/app/page.tsx only.",
  ].join("\n");

  const messages = [
    { role: "system", content: prompt },
    {
      role: "user",
      content: `${repairInstruction}\n\n${diagnostics}\n\n--- FILE: ${TARGET_PATH} ---\n${currentPage}`,
    },
  ];

  const payload = {
    model: resolveModel(provider),
    messages,
    temperature: 0.2,
    ...resolveTokenLimitPayload(provider),
  };

  writeFileSync(REQUEST_PATH, JSON.stringify(payload), "utf-8");
  debugLog(`Built repair request for provider=${provider}`);
}

function extractRawContent(data) {
  const direct = data?.choices?.[0]?.message?.content;
  if (typeof direct === "string") {
    return direct;
  }

  if (Array.isArray(direct)) {
    const joined = direct
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (typeof part?.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("\n");
    if (joined.trim()) {
      return joined;
    }
  }

  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  if (Array.isArray(data?.output)) {
    const outputJoined = data.output
      .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("\n");
    if (outputJoined.trim()) {
      return outputJoined;
    }
  }

  return "";
}

function extractCodeFromRawContent(rawContent) {
  const preferredFencePattern = /```(?:tsx|typescript|jsx)\s*([\s\S]*?)```/i;
  const anyFencePattern = /```[a-zA-Z]*\s*([\s\S]*?)```/;

  const preferredFenceMatch = rawContent.match(preferredFencePattern);
  if (preferredFenceMatch?.[1]?.trim()) {
    debugLog("Detected TSX/TypeScript/JSX fenced code block; extracted inner content.");
    return preferredFenceMatch[1];
  }

  const anyFenceMatch = rawContent.match(anyFencePattern);
  if (anyFenceMatch?.[1]?.trim()) {
    debugLog("Detected generic fenced code block; extracted inner content.");
    return anyFenceMatch[1];
  }

  // Fallback: some providers return plain code without markdown fences.
  const plain = rawContent.trim();
  const directCodeStart = plain.search(/(^|\n)(["']use client["'];?|\s*import\s|\s*export\s+default\s+function\s+)/m);
  if (directCodeStart >= 0) {
    const code = plain.slice(directCodeStart).trim();
    if (code) {
      debugLog("No fenced block found; using raw content fallback from detected code start.");
      return code;
    }
  }

  return "";
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

  const rawContent = extractRawContent(data);
  debugLog(`Raw first choice content length: ${rawContent.length}`);

  const content = extractCodeFromRawContent(rawContent);

  if (!content.trim()) {
    console.error("Model response does not contain parsable page source content.");
    process.exit(1);
  }

  writeFileSync(TARGET_PATH, content, "utf-8");
  debugLog(`Wrote ${content.length} characters to ${TARGET_PATH}`);
  console.log("Updated files:", TARGET_PATH);
}

function normalizeOpencodeResponse(inputPath) {
  const raw = readFileSync(inputPath, "utf-8");
  const payload = {
    choices: [
      {
        message: {
          content: raw,
        },
      },
    ],
  };
  writeFileSync(RESPONSE_PATH, JSON.stringify(payload), "utf-8");
  debugLog(`Normalized opencode output (${raw.length} chars) into ${RESPONSE_PATH}`);
}

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

if (command === "build-request") {
  const mode = arg1 === "slim" ? "slim" : "full";
  const provider = arg2 === "openai" || arg2 === "opencode" || arg2 === "copilot" ? arg2 : "copilot";
  buildRequest(mode, provider);
} else if (command === "build-repair-request") {
  const provider = arg1 === "openai" || arg1 === "opencode" || arg1 === "copilot" ? arg1 : "copilot";
  buildRepairRequest(provider, process.argv[4] ?? "", process.argv[5] ?? "", process.argv[6] ?? "");
} else if (command === "apply-response") {
  applyResponse();
} else if (command === "normalize-opencode") {
  if (!arg1) {
    console.error("Usage: node .github/scripts/ai-feature-gen.mjs normalize-opencode <input-path>");
    process.exit(1);
  }
  normalizeOpencodeResponse(arg1);
} else {
  console.error(
    "Usage: node .github/scripts/ai-feature-gen.mjs <build-request|build-repair-request|apply-response|normalize-opencode> ...",
  );
  process.exit(1);
}
