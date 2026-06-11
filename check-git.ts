import { execSync } from 'child_process';
import * as fs from 'fs';

try {
  const out = execSync('git rev-parse --show-toplevel', { stdio: 'pipe' });
  console.log('Toplevel:', out.toString());
} catch (e: any) {
  console.log('Error 1:', e.message);
}

try {
  // Let's search if there is any git directory around
  const dirs = fs.readdirSync('/app');
  console.log('app contents:', dirs);
} catch (e: any) {
  console.log('Error 2:', e.message);
}
