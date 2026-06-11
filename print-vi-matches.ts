import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

for (let i = 2436; i < 2922; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
  if (match) {
    if (match[1] === 'vi') {
      console.log(`Line ${i + 1}: [${line}]`);
    }
  }
}
