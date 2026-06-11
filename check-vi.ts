import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const langStarts = {
  zh: 17,
  en: 501,
  es: 985,
  ja: 1469,
  ko: 1953,
  vi: 2437
};

// For English block:
const enKeys: string[] = [];
const enLimits = [501, 984]; // line 501 is "en: {" and 984 is "}," (closing en)
for (let i = 501; i < 983; i++) {
  const match = lines[i].match(/^\s*([a-zA-Z0-9_]+):/);
  if (match) {
    enKeys.push(match[1]);
  }
}

console.log("English total keys defined:", enKeys.length);
console.log("Last 20 English keys:", enKeys.slice(-20));

// For Vietnamese block:
const viKeys: string[] = [];
// VI starts at 2437
for (let i = 2437; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const leatherColorsMap')) {
    console.log(`leatherColorsMap starts at index ${i + 1}`);
    break;
  }
  const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
  if (match) {
    viKeys.push(match[1]);
  }
}

console.log("Vietnamese total keys defined:", viKeys.length);
console.log("Last 20 Vietnamese keys:", viKeys.slice(-20));

// Find difference
const enSet = new Set(enKeys);
const extraInEn = enKeys.filter(k => !viKeys.includes(k));
console.log("Keys in EN but missing in VI:", extraInEn);
