import { Tooltip } from '@douyinfe/semi-ui';
import { IconPlus, IconMinus, IconRefresh } from '@douyinfe/semi-icons';
import {
  Square,
  Eraser,
  Undo,
  Redo,
  MousePointer
} from 'lucide-react';

const AnnotationToolsToolbar = ({ activeTool, onToolChange, zoom, onZoomIn, onZoomOut, onResetView }) => {
  const drawingTools = [
    { key: 'select', icon: MousePointer, label: 'Select (V)', aria: 'Select and move shapes' },
    { key: 'rectangle', icon: Square, label: 'Rectangle (R)', aria: 'Draw rectangle' },
    // Uncomment other tools as needed
    // { key: 'polygon', icon: Square, label: 'Polygon (P)', aria: 'Draw polygon' },
    // { key: 'circle', icon: Circle, label: 'Circle (C)', aria: 'Draw circle' },
    // { key: 'line', icon: LineIcon, label: 'Line (L)', aria: 'Draw line' },
    // { key: 'point', icon: PointIcon, label: 'Point (O)', aria: 'Add point' },
  ];

  const utilityTools = [
    { key: 'eraser', icon: Eraser, label: 'Eraser (E)', aria: 'Erase shapes' },
    { key: 'undo', icon: Undo, label: 'Undo (Z)', aria: 'Undo action' },
    { key: 'redo', icon: Redo, label: 'Redo (Shift+Z)', aria: 'Redo action' },
  ];

  const handleToolSelect = (key) => {
    if (onToolChange) {
      onToolChange(key);
    }
  };

  return (
    <>
      <style>{`
        .annotation-toolbar {
          --toolbar-bg: #F3F4F6;
          --toolbar-border: #E5E7EB;
          --toolbar-text: #374151;
          --toolbar-text-light: #6B7280;
          --toolbar-hover-bg: #EFF6FF;
          --toolbar-hover-border: #BFDBFE;
          --toolbar-active-ring: #3B82F6;
          --toolbar-eraser-hover: #FEF2F2;
          --toolbar-eraser-border: #FECACA;
        }
        .dark .annotation-toolbar {
          --toolbar-bg: #1F2937;
          --toolbar-border: #374151;
          --toolbar-text: #D1D5DB;
          --toolbar-text-light: #9CA3AF;
          --toolbar-hover-bg: #1E3A8A;
          --toolbar-hover-border: #3B82F6;
          --toolbar-active-ring: #60A5FA;
          --toolbar-eraser-hover: #7F1D1D;
          --toolbar-eraser-border: #991B1B;
        }
        .annotation-toolbar-btn {
          background: transparent;
          border: 2px solid transparent;
          border-radius: 0.375rem;
          color: var(--toolbar-text);
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          flex-shrink: 0;
        }
        .annotation-toolbar-btn:hover {
          background: var(--toolbar-hover-bg);
          border-color: var(--toolbar-hover-border);
        }
        .annotation-toolbar-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--toolbar-active-ring);
        }
        .annotation-toolbar-btn.active {
          background: var(--toolbar-hover-bg);
          border-color: var(--toolbar-active-ring);
          box-shadow: 0 0 0 2px var(--toolbar-active-ring);
        }
        .annotation-toolbar-btn.eraser:hover {
          background: var(--toolbar-eraser-hover);
          border-color: var(--toolbar-eraser-border);
        }
        .annotation-toolbar-btn.zoom {
          width: 3rem;
          height: 3rem;
        }
        .annotation-toolbar-icon {
          width: 24px;
          height: 24px;
          stroke: currentColor;
        }
        .zoom-percentage {
          font-size: 0.75rem;
          line-height: 1rem;
          text-align: center;
          color: var(--toolbar-text-light);
          margin-top: 0.25rem;
          width: 3rem;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
      <div
        className="annotation-toolbar flex flex-col gap-2"
        style={{
          background: 'var(--toolbar-bg)',
          border: '1px solid var(--toolbar-border)',
          width: '4rem',
          height: '400px',
          minWidth: '4rem',
          padding: '0.5rem',
          alignItems: 'center',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
        role="toolbar"
        aria-label="Annotation tools"
      >
        {/* Core Drawing Tools */}
        <div className="space-y-1">
          {drawingTools.map(({ key, icon: ToolIcon, label, aria }) => (
            <Tooltip key={key} content={label} position="right">
              <button
                onClick={() => handleToolSelect(key)}
                aria-label={aria}
                className={`annotation-toolbar-btn ${activeTool === key ? 'active' : ''}`}
              >
                <ToolIcon className="annotation-toolbar-icon" />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-full h-px my-2"
          style={{ background: 'var(--toolbar-border)' }}
        />

        {/* Utility Tools */}
        <div className="space-y-1 flex-1 flex flex-col justify-end">
          {utilityTools.map(({ key, icon: ToolIcon, label, aria }) => (
            <Tooltip key={key} content={label} position="right">
              <button
                onClick={() => handleToolSelect(key)}
                aria-label={aria}
                className={`annotation-toolbar-btn ${key === 'eraser' ? 'eraser' : ''}`}
              >
                <ToolIcon className="annotation-toolbar-icon" />
              </button>
            </Tooltip>
          ))}

          {/* Zoom Controls (integrated at bottom, styled to match) */}
          <div className="space-y-1 mt-2">
            <Tooltip content="Zoom In (+)" position="right">
              <button
                onClick={onZoomIn}
                aria-label="Zoom In"
                className="annotation-toolbar-btn zoom"
              >
                <IconPlus size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Zoom Out (-)" position="right">
              <button
                onClick={onZoomOut}
                aria-label="Zoom Out"
                className="annotation-toolbar-btn zoom"
              >
                <IconMinus size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Reset View (0)" position="right">
              <button
                onClick={onResetView}
                aria-label="Reset View"
                className="annotation-toolbar-btn zoom"
              >
                <IconRefresh size={20} />
              </button>
            </Tooltip>
            <div className="zoom-percentage">
              {zoom ? Math.round(zoom * 100) : 100}%
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnotationToolsToolbar;