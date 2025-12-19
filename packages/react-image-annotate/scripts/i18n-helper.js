import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to I18nProvider which contains all translations
const i18nProviderPath = path.join(__dirname, '../src/I18nProvider/index.jsx')

if (!fs.existsSync(i18nProviderPath)) {
  console.error('I18nProvider file not found at:', i18nProviderPath)
  process.exit(1)
}

// Read and parse the I18nProvider file
const fileContent = fs.readFileSync(i18nProviderPath, 'utf-8')

// Extract DEFAULT_TRANSLATIONS object
const defaultTranslationsMatch = fileContent.match(
  /export const DEFAULT_TRANSLATIONS = ({[\s\S]*?^})/m
)
if (!defaultTranslationsMatch) {
  console.error('Could not find DEFAULT_TRANSLATIONS in I18nProvider')
  process.exit(1)
}

// Extract BUILT_IN_TRANSLATIONS object
const builtInTranslationsMatch = fileContent.match(
  /export const BUILT_IN_TRANSLATIONS = ({[\s\S]*?^})\s*$/m
)
if (!builtInTranslationsMatch) {
  console.error('Could not find BUILT_IN_TRANSLATIONS in I18nProvider')
  process.exit(1)
}

// Parse the translations (simple regex-based approach)
function parseTranslationKeys(objString) {
  const keys = []
  // Match quoted keys: "key": value or key: value
  const keyMatches = objString.matchAll(/["']?([a-zA-Z0-9_.]+)["']?\s*:/g)
  for (const match of keyMatches) {
    const key = match[1]
    // Skip language codes (en, zh, vi, etc)
    if (
      !['en', 'zh', 'vi', 'DEFAULT_TRANSLATIONS', 'settings'].includes(key)
    ) {
      keys.push(key)
    }
  }
  return [...new Set(keys)] // Remove duplicates
}

// Get English keys (reference)
const enKeys = parseTranslationKeys(defaultTranslationsMatch[1])

console.log(`\n✓ Found ${enKeys.length} translation keys in DEFAULT_TRANSLATIONS\n`)

// Extract each language from BUILT_IN_TRANSLATIONS
const languageMatches = builtInTranslationsMatch[1].matchAll(
  /(\w+):\s*{([^}]+)}/g
)

let hasErrors = false

for (const match of languageMatches) {
  const langCode = match[1]
  if (langCode === 'en') continue // Skip English (it's the reference)

  const langObj = match[2]
  const langKeys = parseTranslationKeys(langObj)

  // Find missing keys
  const missingKeys = enKeys.filter((key) => !langKeys.includes(key))

  if (missingKeys.length > 0) {
    console.log(`❌ Missing keys in ${langCode}:`)
    missingKeys.forEach((key) => console.log(`  - ${key}`))
    console.log()
    hasErrors = true
  } else {
    console.log(`✓ ${langCode} is up to date (${langKeys.length} keys)`)
  }
}

if (hasErrors) {
  console.log(
    '\n⚠️  Some translations are missing. Please update I18nProvider/index.jsx\n'
  )
  process.exit(1)
} else {
  console.log('\n✅ All translations are complete!\n')
  process.exit(0)
}
