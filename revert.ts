import { execSync } from 'child_process';
execSync('git checkout -- src/utils/translations.ts');
console.log('Restored src/utils/translations.ts successfully using git!');
