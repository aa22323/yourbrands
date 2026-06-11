import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const text = fs.readFileSync(filePath, 'utf8');

const badChars: { index: number; line: number; char: string; code: number }[] = [];
let line = 1;
for (let i = 0; i < text.length; i++) {
  const code = text.charCodeAt(i);
  if (text[i] === '\n') {
    line++;
  }
  if (code === 65533) {
    badChars.push({ index: i, line, char: text[i], code });
  }
}

console.log("Total 65533 characters:", badChars.length);
if (badChars.length > 0) {
  console.log("First 10 occurrences:");
  console.log(badChars.slice(0, 10));
}
