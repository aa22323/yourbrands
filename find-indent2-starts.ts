import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

// Find all matches of `en: {`, `es: {`, etc. with exact 2 spaces indentation
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^  (zh|en|es|ja|ko|vi):\s*\{/);
  if (match) {
    console.log(`Line ${i + 1}: ${line}`);
  }
}
