import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

console.log("--- es - checkoutStep2 context ---");
for (let i = 1230; i <= 1236; i++) {
  console.log(`Line ${i + 1}: [${lines[i]}]`);
}

console.log("--- ja - checkoutStep2 context ---");
for (let i = 1714; i <= 1720; i++) {
  console.log(`Line ${i + 1}: [${lines[i]}]`);
}
