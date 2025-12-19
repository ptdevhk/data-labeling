import { getApplicationKeyMap } from "react-hotkeys"

export const getHotkeyHelpText = (commandName) => {
  try {
    const keyMap = getApplicationKeyMap()
    if (!keyMap) return ""
    const firstSequence = keyMap[commandName]?.sequences?.[0]?.sequence
    if (!firstSequence) return ""
    return ` (${firstSequence})`
  } catch {
    // Silently handle cases where react-hotkeys context is not properly initialized
    // (e.g., multiple nested HotKeys components or missing context)
    // This is a known limitation and doesn't affect core functionality
    return ""
  }
}

export default getHotkeyHelpText
