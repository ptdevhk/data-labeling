// Utility functions to replace seamless-immutable with immer
import { produce } from "immer"

// Replace seamless-immutable's getIn
export const getIn = (obj, path, defaultValue) => {
  if (!obj) return defaultValue
  const keys = Array.isArray(path) ? path : [path]
  let current = obj

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return defaultValue
    }
    current = current[key]
  }

  return current !== undefined ? current : defaultValue
}

// Replace seamless-immutable's setIn
export const setIn = (obj, path, value) => {
  return produce(obj, (draft) => {
    const keys = Array.isArray(path) ? path : [path]
    let current = draft

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (current[key] === undefined) {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  })
}

// Replace seamless-immutable's updateIn
export const updateIn = (obj, path, updater) => {
  return produce(obj, (draft) => {
    const keys = Array.isArray(path) ? path : [path]
    let current = draft

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (current[key] === undefined) {
        current[key] = {}
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]
    current[lastKey] = updater(current[lastKey])
  })
}

// Replace seamless-immutable's without
export const without = (obj, ...keys) => {
  return produce(obj, (draft) => {
    keys.forEach((key) => {
      if (Array.isArray(draft)) {
        draft.splice(key, 1)
      } else {
        delete draft[key]
      }
    })
  })
}

// Replace seamless-immutable's asMutable (immer drafts are already mutable)
export const asMutable = (obj, options = {}) => {
  if (options.deep) {
    return JSON.parse(JSON.stringify(obj))
  }
  return Array.isArray(obj) ? [...obj] : { ...obj }
}

// Replace seamless-immutable's default export
export const makeImmutable = (obj) => {
  // In immer, we don't need to make objects immutable upfront
  // They become immutable automatically when not in a producer
  return obj
}

export default makeImmutable
