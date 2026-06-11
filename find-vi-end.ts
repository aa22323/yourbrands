import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

for (let i = 2430; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^\s*\};/)) {
    console.log(`Closing brace }; found on line ${i + 1}: ${line}`);
    break;
  }
}
