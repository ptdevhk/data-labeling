/**
 * Headless Annotator Hooks
 *
 * Framework-agnostic hooks for building custom annotation UIs.
 * These hooks contain all the business logic without any UI dependencies.
 *
 * @example
 * ```js
 * import { useAnnotator } from '@karlorz/react-image-annotate/headless'
 *
 * function MyAnnotator() {
 *   const { state, actions, regions } = useAnnotator({
 *     images: [{ src: '/image.jpg' }]
 *   })
 *
 *   return <YourCustomUI state={state} actions={actions} />
 * }
 * ```
 */

export { useAnnotator, default } from "./useAnnotator.js"

// Re-export types for TypeScript users
export * from "./types"
