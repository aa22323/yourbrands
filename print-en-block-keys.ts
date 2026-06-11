import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const enKeys: {key: string, line: number, val: string}[] = [];
for (let i = 501; i < 984; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(["'])(.*)\2\s*,?\s*$/);
  if (match) {
    enKeys.push({ key: match[1], line: i + 1, val: match[3] });
  } else {
    // Treat complex lines or non-matching lines also as key but log them
    const simpleMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
    if (simpleMatch) {
      enKeys.push({ key: simpleMatch[1], line: i + 1, val: line.trim() });
    }
  }
}

// Find key "orderLockedSuccess" in the list
const idx = enKeys.findIndex(k => k.key === 'orderLockedSuccess');
console.log(`Found orderLockedSuccess at index ${idx}.`);
console.log("Remaining keys in English block:");
for (let j = idx; j < enKeys.length; j++) {
  console.log(`${j - idx + 1}. ${enKeys[j].key}: ${enKeys[j].val}`);
}
