export default (key, defaultValue) => {
  try {
    return JSON.parse(window.localStorage[`__REACT_IMAGE_ANNOTATE_${key}`])
  } catch (_e) {
    return defaultValue
  }
}
