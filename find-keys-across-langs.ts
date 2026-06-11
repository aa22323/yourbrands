import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const searchKeys = [
  'checkoutStep1',
  'checkoutStep2',
  'checkoutStep3',
  'checkoutSuccessStep1',
  'checkoutSuccessStep2',
  'checkoutSuccessStep3'
];

const langStarts = {
  zh: 17,
  en: 501,
  es: 985,
  ja: 1469,
  ko: 1953,
  vi: 2437
};

const results: Record<string, Record<string, string>> = {};
for (const key of searchKeys) {
  results[key] = {};
}

for (const [lang, startLine] of Object.entries(langStarts)) {
  const range = lines.slice(startLine - 1, startLine + 480);
  for (const line of range) {
    const trimmed = line.trim();
    for (const key of searchKeys) {
      if (trimmed.startsWith(key + ':') || trimmed.startsWith('"' + key + '":') || trimmed.startsWith('\'' + key + '\':')) {
        results[key][lang] = trimmed;
      }
    }
  }
}

console.log(JSON.stringify(results, null, 2));
