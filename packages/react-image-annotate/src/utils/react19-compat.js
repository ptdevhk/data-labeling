// React 19 Compatibility Shim
// This polyfills ReactDOM.findDOMNode which was removed in React 19
// but is still used by react-draggable@4.5.0

import ReactDOM from "react-dom"

if (!ReactDOM.findDOMNode) {
  console.warn(
    "[React 19 Compat] Polyfilling ReactDOM.findDOMNode for legacy libraries",
  )

  // Polyfill findDOMNode to return the element itself
  // This works because modern React components should use refs
  ReactDOM.findDOMNode = function (componentOrElement) {
    // If it's null/undefined, return null
    if (componentOrElement == null) {
      return null
    }

    // If it's already a DOM node, return it
    if (componentOrElement.nodeType === 1) {
      return componentOrElement
    }

    // If it's a React component instance with a ref
    if (componentOrElement._reactInternals) {
      // Try to find the DOM node through React's internal structure
      const fiber = componentOrElement._reactInternals
      let node = fiber

      // Walk up the fiber tree to find a host component (DOM node)
      while (node) {
        if (node.stateNode && node.stateNode.nodeType === 1) {
          return node.stateNode
        }
        if (node.child) {
          node = node.child
        } else if (node.sibling) {
          node = node.sibling
        } else {
          // Walk back up
          while (node.return && !node.return.sibling) {
            node = node.return
          }
          if (node.return) {
            node = node.return.sibling
          } else {
            break
          }
        }
      }
    }

    console.warn(
      "[React 19 Compat] Could not find DOM node for:",
      componentOrElement,
    )
    return null
  }
}

export default ReactDOM
