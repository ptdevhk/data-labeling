# Headless Annotator Examples

This directory contains examples showing how to use the headless `useAnnotator` hook with different UI frameworks.

## Examples

### 1. Semi Design Integration (`semi-design-example.jsx`)
Complete example showing integration with Semi Design UI library and react-i18next.

### 2. Tailwind CSS Example (`tailwind-example.jsx`)
Minimal example using Tailwind CSS for styling.

### 3. Vanilla React Example (`vanilla-example.jsx`)
Basic example with no UI framework dependencies.

## Quick Start

```bash
# Install the package
npm install @karlorz/react-image-annotate

# For headless use, you don't need MUI dependencies
# Just install React
npm install react react-dom
```

## Basic Usage

```jsx
import { useAnnotator } from '@karlorz/react-image-annotate/headless'

function MyAnnotator() {
  const { state, actions, regions, currentImage } = useAnnotator({
    images: [
      { src: '/image1.jpg', name: 'Image 1' },
      { src: '/image2.jpg', name: 'Image 2' },
    ],
    onExit: (output) => {
      console.log('Annotation complete:', output)
    }
  })

  return (
    <div>
      <h1>{currentImage?.name}</h1>

      {/* Your custom toolbar */}
      <div>
        <button onClick={() => actions.selectTool('create-box')}>
          Box Tool
        </button>
        <button onClick={() => actions.selectTool('create-polygon')}>
          Polygon Tool
        </button>
      </div>

      {/* Your custom canvas (simplified) */}
      <canvas width={800} height={600} />

      {/* Or use getCanvasProps() for automatic event handling */}
      <canvas
        width={800}
        height={600}
        {...actions.getCanvasProps()}
      />

      {/* Your custom region list */}
      <ul>
        {regions.map(region => (
          <li key={region.id}>
            {region.cls || 'Unlabeled'}
            <button onClick={() => actions.deleteRegion(region)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## API Reference

### useAnnotator(config)

**Parameters:**
- `config` (object): Configuration object

**Returns:**
- `state` (object): Complete annotation state
- `actions` (object): Memoized action creators
  - `getCanvasProps()` - Returns event handlers for canvas (onMouseMove, onMouseDown, onMouseUp)
  - `selectTool(tool)` - Select annotation tool
  - `deleteRegion(region)` - Delete a region
  - And more... (see types.ts)
- `regions` (array): Current regions
- `currentImage` (object|null): Currently active image
- `currentImageIndex` (number|undefined): Index of current image
- `dispatch` (function): Raw dispatch function for advanced use
- `getOutput` (function): Get output without history
- `onRegionClassAdded` (function): Callback for region class added

See `types.ts` for complete TypeScript definitions.
