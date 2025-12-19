/**
 * Input sanitization utilities to prevent XSS attacks
 * Sanitizes user-provided text content for safe rendering
 */

/**
 * Sanitize text input by escaping HTML special characters
 * This prevents XSS attacks from user-provided annotation labels
 *
 * @param {string} text - User input to sanitize
 * @returns {string} Sanitized text safe for rendering
 */
export function sanitizeText(text) {
  if (typeof text !== "string") {
    return ""
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 * Allows only http, https, and data URLs
 *
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url) {
  if (typeof url !== "string") {
    return ""
  }

  const trimmed = url.trim().toLowerCase()

  // Allow safe protocols
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return url
  }

  // Reject javascript: and other potentially dangerous protocols
  if (trimmed.includes("javascript:") || trimmed.includes("data:text/html")) {
    console.warn("Blocked potentially dangerous URL:", url)
    return ""
  }

  return url
}

/**
 * Validate and sanitize annotation data
 * @param {Object} annotation - Annotation object to validate
 * @returns {Object} Sanitized annotation object
 */
export function sanitizeAnnotation(annotation) {
  if (!annotation || typeof annotation !== "object") {
    return {}
  }

  const sanitized = { ...annotation }

  // Sanitize text fields
  if (sanitized.cls) {
    sanitized.cls = sanitizeText(sanitized.cls)
  }
  if (sanitized.comment) {
    sanitized.comment = sanitizeText(sanitized.comment)
  }
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags.map(sanitizeText)
  }

  // Validate numeric fields
  if (typeof sanitized.x === "number" && (sanitized.x < 0 || sanitized.x > 1)) {
    console.warn("Invalid x coordinate:", sanitized.x)
    sanitized.x = Math.max(0, Math.min(1, sanitized.x))
  }
  if (typeof sanitized.y === "number" && (sanitized.y < 0 || sanitized.y > 1)) {
    console.warn("Invalid y coordinate:", sanitized.y)
    sanitized.y = Math.max(0, Math.min(1, sanitized.y))
  }

  return sanitized
}

export default {
  sanitizeText,
  sanitizeUrl,
  sanitizeAnnotation,
}
