import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function run(command) {
  execSync(command, { stdio: "inherit" });
}

export function runCapture(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
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
  runCommand('git commit -m "feat: add AI-generated Friday I\'m in Love content"');
  runCommand("git push origin main");
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
