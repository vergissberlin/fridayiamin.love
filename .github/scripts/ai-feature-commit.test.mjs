import test from "node:test";
import assert from "node:assert/strict";

import {
  buildConventionalCommitSubject,
  normalizeConventionalSubject,
  parseChangedFiles,
} from "./ai-feature-commit.mjs";

test("parseChangedFiles splits and trims paths", () => {
  assert.deepEqual(parseChangedFiles("a.ts\n\nb.ts\n"), ["a.ts", "b.ts"]);
});

test("normalizeConventionalSubject trims and caps length", () => {
  assert.equal(normalizeConventionalSubject("  feat: hello  "), "feat: hello");
  const long = `feat: ${"x".repeat(80)}`;
  assert.ok(normalizeConventionalSubject(long).length <= 72);
});

test("buildConventionalCommitSubject detects docs-only changes", () => {
  assert.equal(
    buildConventionalCommitSubject({ files: ["README.md"], diffSample: "" }),
    "docs: update documentation",
  );
});

test("buildConventionalCommitSubject detects workflow-only changes", () => {
  assert.equal(
    buildConventionalCommitSubject({
      files: [".github/workflows/ai-feature-gen.yml"],
      diffSample: "on:\n  push:",
    }),
    "ci: update GitHub Actions workflows",
  );
});

test("buildConventionalCommitSubject uses diff keywords for page.tsx", () => {
  assert.equal(
    buildConventionalCommitSubject({
      files: ["src/app/page.tsx"],
      diffSample: "+ const x = 'SpotifyPlayer'",
    }),
    "feat: improve Spotify section on landing page",
  );
  assert.equal(
    buildConventionalCommitSubject({
      files: ["src/app/page.tsx", "src/app/page.module.css"],
      diffSample: "+ .fridayCountdown",
    }),
    "feat: enhance landing page content and styles",
  );
});
