import * as fs from 'fs';
import * as path from 'path';

const files = [
  path.join(process.cwd(), 'src', 'utils', 'translations.ts'),
  path.join(process.cwd(), 'src', 'App.tsx'),
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const matches = [...text.matchAll(/productImageOverrides/g)];
    console.log(`File ${f} has ${matches.length} matches for productImageOverrides`);
  }
}
