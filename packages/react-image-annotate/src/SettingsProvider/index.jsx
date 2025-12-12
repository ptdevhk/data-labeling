import React, { createContext, useContext, useState } from "react"

const defaultSettings = {
  showCrosshairs: true,
  showHighlightBox: true,
  wasdMode: false,
  videoPlaybackSpeed: "1x",
}

export const SettingsContext = createContext(defaultSettings)

const pullSettingsFromLocalStorage = () => {
  if (!window || !window.localStorage) return {}
  let settings = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key.startsWith("settings_")) {
      try {
        settings[key.replace("settings_", "")] = JSON.parse(
          window.localStorage.getItem(key),
        )
      } catch (_e) {
        // Ignore localStorage errors
      }
    }
  }
  return settings
}

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
  const [state, changeState] = useState(() => ({
    ...defaultSettings,
    ...pullSettingsFromLocalStorage(),
  }))
  const changeSetting = (setting, value) => {
    changeState({ ...state, [setting]: value })
    window.localStorage.setItem(`settings_${setting}`, JSON.stringify(value))
  }
  return (
    <SettingsContext.Provider value={{ ...state, changeSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsProvider
