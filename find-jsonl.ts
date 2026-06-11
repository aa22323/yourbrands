import * as fs from 'fs';
import * as path from 'path';

function findJsonl(dir: string, depth: number = 0) {
  if (depth > 5) return;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.git') {
        continue;
      }
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          findJsonl(fullPath, depth + 1);
        } else if (file.endsWith('.jsonl')) {
          console.log("Found JSONL file:", fullPath, "Size:", stats.size);
        }
      } catch (err) {}
    }
  } catch (err) {}
}

console.log("Searching from /app...");
findJsonl('/app');
console.log("Searching from /...");
findJsonl('/');
