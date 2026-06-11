import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const line = lines[787]; // 788 0-based
console.log("English Line:", line);
for (let i = 0; i < line.length; i++) {
  console.log(`Char ${i}: [${line[i]}] (code: ${line.charCodeAt(i)})`);
}
