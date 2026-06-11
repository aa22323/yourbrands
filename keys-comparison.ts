import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const keysZH: string[] = [];
let inZH = false;

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i];

  if (lineNum === 17) inZH = true;
  if (lineNum === 526) inZH = false;

  if (inZH) {
    const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (match) {
      keysZH.push(match[1]);
    }
  }
}

console.log("Total Keys in first ZH block (lines 17-526):", keysZH.length);

const firstBlockKeys = new Set(keysZH);
const secondBlockKeysRange = lines.slice(2072, 2571);
const secondBlockKeys: string[] = [];

for (const line of secondBlockKeysRange) {
  const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
  if (match) {
    secondBlockKeys.push(match[1]);
  }
}
console.log("Total Keys in second EN block (lines 2073-2571):", secondBlockKeys.length);

// Compare them
let intersection = 0;
for (const k of secondBlockKeys) {
  if (firstBlockKeys.has(k)) {
    intersection++;
  }
}

console.log("Intersection between first block and second block keys:", intersection);
if (intersection === 0) {
  console.log("The two blocks contain completely DIFFERENT keys!");
} else if (intersection === keysZH.length) {
  console.log("The two blocks contain exactly the SAME keys!");
} else {
  console.log("The blocks are partially overlapping.");
}
