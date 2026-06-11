import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

for (let i = 2437; i <= 2685; i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}
