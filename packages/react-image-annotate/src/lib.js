// @flow

import Annotator from "./Annotator"

export { Annotator }

// NEW: Export i18n support (v3.x)
export {
  I18nProvider,
  useI18n,
  DEFAULT_TRANSLATIONS,
  BUILT_IN_TRANSLATIONS,
} from "./I18nProvider"

// Export headless hooks
export { useAnnotator } from "./hooks/useAnnotator"

// Export layout components
export { default as MainLayout } from "./MainLayout"
export { default as SettingsProvider, useSettings } from "./SettingsProvider"

export default Annotator
