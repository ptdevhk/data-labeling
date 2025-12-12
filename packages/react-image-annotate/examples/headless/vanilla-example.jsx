/**
 * Example: Vanilla React (No UI Framework)
 *
 * This example shows the most minimal integration with just React
 * and basic inline styles.
 */

import React from 'react'
import { useAnnotator } from '@karlorz/react-image-annotate/headless'

export function VanillaAnnotator({ images, onSave }) {
  const { state, actions, regions, currentImage } = useAnnotator({
    images,
    onExit: onSave,
  })

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Toolbar */}
      <div style={{ width: 200, borderRight: '1px solid #ddd', padding: 16 }}>
        <h3>Tools</h3>
        <button
          onClick={() => actions.selectTool('select')}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 8,
            padding: 8,
            background: state.selectedTool === 'select' ? '#007bff' : '#f0f0f0',
            color: state.selectedTool === 'select' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Select
        </button>
        <button
          onClick={() => actions.selectTool('create-box')}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 8,
            padding: 8,
            background: state.selectedTool === 'create-box' ? '#007bff' : '#f0f0f0',
            color: state.selectedTool === 'create-box' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Box
        </button>
        <button
          onClick={() => actions.selectTool('create-polygon')}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 8,
            padding: 8,
            background: state.selectedTool === 'create-polygon' ? '#007bff' : '#f0f0f0',
            color: state.selectedTool === 'create-polygon' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Polygon
        </button>

        <h3 style={{ marginTop: 24 }}>Regions ({regions.length})</h3>
        {regions.map((region, index) => (
          <div
            key={region.id}
            style={{
              padding: 8,
              background: '#f9f9f9',
              marginBottom: 4,
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{region.cls || `Region ${index + 1}`}</span>
            <button
              onClick={() => actions.deleteRegion(region)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'red',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>{currentImage?.name || 'No Image'}</h2>
          <button
            onClick={() => onSave(state)}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f5f5f5',
          }}
        >
          <div
            style={{
              width: '80%',
              height: '80%',
              background: 'white',
              border: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Canvas would render here
          </div>
        </div>
      </div>
    </div>
  )
}

export default VanillaAnnotator
