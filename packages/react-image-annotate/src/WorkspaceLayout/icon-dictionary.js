// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import { createContext, useContext } from "react"

export const IconDictionaryContext = createContext({})

const emptyObj = {}

export const useIconDictionary = () => {
  return useContext(IconDictionaryContext) || emptyObj
}
