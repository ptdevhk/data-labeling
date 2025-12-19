
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../src/locales');
const enFilePath = path.join(localesDir, 'en.json');

if (!fs.existsSync(enFilePath)) {
  console.error('English locale file (en.json) not found.');
  // eslint-disable-next-line no-undef
  process.exit(1);
}

const enTranslations = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));

function findMissingKeys(target, reference, path = '') {
  let missingKeys = [];
  for (const key in reference) {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof reference[key] === 'object' && reference[key] !== null) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        missingKeys = missingKeys.concat(findMissingKeys(target[key], reference[key], currentPath));
      } else {
        missingKeys.push(currentPath);
      }
    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
      missingKeys.push(currentPath);
    }
  }
  return missingKeys;
}

fs.readdirSync(localesDir).forEach(file => {
  if (file !== 'en.json' && file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    const targetTranslations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const missing = findMissingKeys(targetTranslations, enTranslations);

    if (missing.length > 0) {
      console.log(`Missing keys in ${file}:`);
      missing.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log(`${file} is up to date.`);
    }
  }
});
