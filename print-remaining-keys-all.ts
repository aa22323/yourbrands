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

const languages = ['zh', 'en', 'es', 'ja', 'ko'];
const keysAll: Record<string, {key: string, val: string}[]> = {};

for (const lang of languages) {
  const start = starts[lang];
  let end = lines.length;
  // find next language start
  const idx = ['zh','en','es','ja','ko','vi'].indexOf(lang);
  const nextLang = ['zh','en','es','ja','ko','vi'][idx + 1];
  end = starts[nextLang];
  
  keysAll[lang] = [];
  for (let i = start + 1; i < end; i++) {
    const line = lines[i];
    const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(["'])(.*)\2\s*,?\s*$/);
    if (match) {
      keysAll[lang].push({ key: match[1], val: match[3] });
    } else {
      const simpleMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
      if (simpleMatch) {
         keysAll[lang].push({ key: simpleMatch[1], val: line.trim() });
      }
    }
  }
}

// Find orderLockedSuccess index in EN
const enKeys = keysAll['en'];
const idxEn = enKeys.findIndex(k => k.key === 'orderLockedSuccess');

console.log("From orderLockedSuccess to the end:");
for (let j = idxEn; j < Math.min(idxEn + 10, enKeys.length); j++) {
  console.log(`\nKey: ${enKeys[j].key}`);
  for (const lang of languages) {
    const kItem = keysAll[lang].find(x => x.key === enKeys[j].key);
    console.log(`  ${lang}: ${kItem ? kItem.val : 'MISSING'}`);
  }
}
