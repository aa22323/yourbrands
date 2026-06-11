import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const starts: Record<string, number> = {
  zh: 16,
  en: 500,
  es: 984,
  ja: 1468,
  ko: 1952,
  vi: 2436
};

const languages = ['zh', 'en', 'es', 'ja', 'ko', 'vi'];
const keyValues: Record<string, string[]> = {
  zh: [], en: [], es: [], ja: [], ko: [], vi: []
};

for (let idx = 0; idx < languages.length; idx++) {
  const lang = languages[idx];
  const start = starts[lang];
  let end = (idx < languages.length - 1) ? starts[languages[idx + 1]] : lines.length;
  if (lang === 'vi') {
    for (let k = start; k < lines.length; k++) {
      if (lines[k].includes('const leatherColorsMap') || lines[k].match(/^\s*\};\s*$/)) {
        end = k;
        break;
      }
    }
  }
  
  for (let ln = start + 1; ln < end; ln++) {
    const line = lines[ln];
    const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
    if (match) {
      keyValues[lang].push(match[1]);
    }
  }
}

const enSet = new Set(keyValues['en']);
const viKeys = keyValues['vi'];

const extraInVi = viKeys.filter(k => !enSet.has(k));
console.log("Keys in VI but missing in EN:", extraInVi);

const countMap: Record<string, number> = {};
for (const k of viKeys) {
  countMap[k] = (countMap[k] || 0) + 1;
}
const dups = Object.keys(countMap).filter(k => countMap[k] > 1);
console.log("Duplicate keys in VI block:", dups);
