import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function runCapture(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}

function main() {
  const status = runCapture("git status --porcelain");
  if (!status) {
    console.log("No changes");
    return;
  }

  run('git config user.name "github-actions[bot]"');
  run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  run("git add .");
  run('git commit -m "feat: add AI-generated Friday I\'m in Love content"');
  run("git push origin main");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
