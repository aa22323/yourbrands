import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

let level = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('export const TRANSLATIONS')) {
    console.log(`TRANSLATIONS starts at line ${i + 1}`);
  }
  // If we're inside TRANSLATIONS and at indentation 2 (e.g. "  en: {")
  const match = line.match(/^  (zh|en|es|ja|ko|vi):\s*\{/);
  if (match) {
    console.log(`Language block ${match[1].toUpperCase()} starts at line ${i + 1}`);
  }
}
