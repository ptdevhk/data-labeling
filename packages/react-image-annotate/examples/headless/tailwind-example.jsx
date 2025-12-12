/**
 * Example: Tailwind CSS Integration
 *
 * This example shows a minimal integration using only Tailwind CSS
 * for styling, without any component library.
 */

import React from 'react'
import { useAnnotator } from '@karlorz/react-image-annotate/headless'

export function TailwindAnnotator({ images, onSave }) {
  const { state, actions, regions, currentImage, getOutput } = useAnnotator({
    images,
    enabledTools: ['select', 'create-box', 'create-polygon'],
    onExit: onSave,
  })

  const tools = [
    { id: 'select', name: 'Select', icon: '⚲' },
    { id: 'create-box', name: 'Box', icon: '▢' },
    { id: 'create-polygon', name: 'Polygon', icon: '⬡' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Toolbar */}
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => actions.selectTool(tool.id)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-xl
              transition-colors duration-200
              ${
                state.selectedTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentImage?.name || 'No Image'}
          </h1>
          <button
            onClick={() => onSave(getOutput())}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-gray-400">Canvas rendering would go here</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Regions */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Regions ({regions.length})
          </h2>

          {regions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No regions yet. Select a tool to start annotating.
            </p>
          ) : (
            <ul className="space-y-2">
              {regions.map((region, index) => (
                <li
                  key={region.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: region.color || '#3b82f6' }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {region.cls || `Region ${index + 1}`}
                    </span>
                  </div>
                  <button
                    onClick={() => actions.deleteRegion(region)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default TailwindAnnotator
