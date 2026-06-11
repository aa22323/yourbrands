import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

let start = -1;
let end = -1;
for (let i = 501; i < 985; i++) {
  if (lines[i].includes('orderNoLabel:')) {
    start = i;
  }
}
end = 984; // end of 'en' block is line 984 (or slightly before)

for (let i = start; i <= end; i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}
