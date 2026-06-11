import { execSync } from 'child_process';

try {
  const diff = execSync('git diff HEAD~1 -- src/utils/translations.ts', { encoding: 'utf8' });
  console.log("GIT DIFF PREVIOUS COMMIT:");
  console.log(diff.slice(0, 1000));
  console.log("... (truncated Diff) ...");
} catch (e: any) {
  console.error("Error running git diff:", e.message);
  try {
    const status = execSync('git status', { encoding: 'utf8' });
    console.log("Git Status:\n", status);
  } catch (e2: any) {
    console.error("Error running git status:", e2.message);
  }
}
