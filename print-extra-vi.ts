import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const viKeys: string[] = [];
for (let i = 2436; i < 2922; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
  if (match) {
    viKeys.push(match[1]);
  }
}

const enKeys: string[] = [];
for (let i = 500; i < 984; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
  if (match) {
    enKeys.push(match[1]);
  }
}

console.log("VI Keys count:", viKeys.length);
console.log("EN Keys count:", enKeys.length);

const enSet = new Set(enKeys);
const extraInVi = viKeys.filter(k => !enSet.has(k));
console.log("Keys in VI block but not in EN block:", extraInVi);

const viSet = new Set(viKeys);
const extraInEn = enKeys.filter(k => !viSet.has(k));
console.log("Keys in EN block but not in VI block:", extraInEn);
