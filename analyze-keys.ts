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
const keyValues: Record<string, Record<string, string>> = {
  zh: {}, en: {}, es: {}, ja: {}, ko: {}, vi: {}
};

for (let idx = 0; idx < languages.length; idx++) {
  const lang = languages[idx];
  const start = starts[lang];
  
  // Walk until next language block or limit
  let end = (idx < languages.length - 1) ? starts[languages[idx + 1]] : lines.length;
  if (lang === 'vi') {
    // Walk until we hit `const leatherColorsMap` or `};` of TRANSLATIONS
    for (let k = start; k < lines.length; k++) {
      if (lines[k].includes('const leatherColorsMap') || lines[k].match(/^\s*\};\s*$/)) {
        end = k;
        break;
      }
    }
  }
  
  console.log(`Language block ${lang.toUpperCase()}: line ${start + 1} to ${end + 1}`);
  
  for (let ln = start + 1; ln < end; ln++) {
    const line = lines[ln];
    // Simple key-value regex
    const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(["'])(.*)\2\s*,?\s*$/);
    if (match) {
      keyValues[lang][match[1]] = match[3];
    } else {
      const complexMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
      if (complexMatch) {
         keyValues[lang][complexMatch[1]] = line.trim();
      }
    }
  }
  console.log(`Extracted ${Object.keys(keyValues[lang]).length} keys in ${lang.toUpperCase()}`);
}

const enKeys = Object.keys(keyValues['en']);
for (const lang of languages) {
  if (lang === 'en') continue;
  const targetKeys = Object.keys(keyValues[lang]);
  const missing = enKeys.filter(k => !targetKeys.includes(k));
  console.log(`Language ${lang.toUpperCase()} has ${targetKeys.length} keys. Missing from EN: ${missing.length}`);
}
