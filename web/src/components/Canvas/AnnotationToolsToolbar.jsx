import { useMemo } from 'react';
import { IconPlus, IconMinus, IconRefresh } from '@douyinfe/semi-icons';
import {
  Square,
  Eraser,
  Undo,
  Redo,
  MousePointer,
  Maximize2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AnnotationToolsToolbar = ({ activeTool, onToolChange, zoom, zoomMode, onZoomIn, onZoomOut, onResetView, onToggleFitWidth }) => {
  const { t } = useTranslation();

  const drawingTools = useMemo(() => ([
    {
      key: 'select',
      icon: MousePointer,
      label: `${t('annotation.tools.select')} (V)`,
      aria: t('annotation.tools.hints.select', 'Select and move shapes'),
    },
    {
      key: 'rectangle',
      icon: Square,
      label: `${t('annotation.tools.rectangle')} (R)`,
      aria: t('annotation.tools.hints.rectangle', 'Draw rectangle'),
    },
  ]), [t]);

  const utilityTools = useMemo(() => ([
    {
      key: 'eraser',
      icon: Eraser,
      label: `${t('annotation.tools.eraser')} (E)`,
      aria: t('annotation.tools.hints.eraser', 'Erase shapes'),
    },
    {
      key: 'undo',
      icon: Undo,
      label: `${t('annotation.tools.undo')} (Z)`,
      aria: t('annotation.tools.hints.undo', 'Undo action'),
    },
    {
      key: 'redo',
      icon: Redo,
      label: `${t('annotation.tools.redo')} (Shift+Z)`,
      aria: t('annotation.tools.hints.redo', 'Redo action'),
    },
  ]), [t]);

  const handleToolSelect = (key) => {
    if (onToolChange) {
      onToolChange(key);
    }
  };

  return (
    <>
      <style>{`
        .annotation-toolbar {
          --toolbar-bg: var(--semi-color-bg-1);
          --toolbar-border: var(--semi-color-border);
          --toolbar-text: var(--semi-color-text-0);
          --toolbar-text-light: var(--semi-color-text-2);
          --toolbar-hover-bg: var(--semi-color-fill-0);
          --toolbar-hover-border: var(--semi-color-border);
          --toolbar-active-ring: var(--semi-color-primary);
          --toolbar-eraser-hover: var(--semi-color-fill-2);
          --toolbar-eraser-border: var(--semi-color-border);
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
          color: var(--toolbar-active-ring);
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
          width: '4.5rem',
          height: '100%',
          minWidth: '4.5rem',
          padding: '0.75rem 0.5rem',
          alignItems: 'center',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
        role="toolbar"
        aria-label={t('annotation.tools.toolbarAria', 'Annotation tools')}
      >
        {/* Core Drawing Tools */}
        <div className="space-y-1">
          {drawingTools.map(({ key, icon: ToolIcon, label, aria }) => (
            <button
              key={key}
              onClick={() => handleToolSelect(key)}
              aria-label={aria}
              title={label}
              className={`annotation-toolbar-btn ${activeTool === key ? 'active' : ''}`}
            >
              <ToolIcon className="annotation-toolbar-icon" />
            </button>
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
            <button
              key={key}
              onClick={() => handleToolSelect(key)}
              aria-label={aria}
              title={label}
              className={`annotation-toolbar-btn ${key === 'eraser' ? 'eraser' : ''}`}
            >
              <ToolIcon className="annotation-toolbar-icon" />
            </button>
          ))}

          {/* Zoom Controls (integrated at bottom, styled to match) */}
          <div className="space-y-1 mt-2">
            <button
              onClick={onToggleFitWidth}
              aria-label={t('annotation.canvas.fitWidth', 'Fit Width')}
              title={t('annotation.canvas.fitWidthTooltip', 'Toggle zoom follows window width')}
              className={`annotation-toolbar-btn zoom ${zoomMode === 'FIT_WIDTH' ? 'active' : ''}`}
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={onZoomIn}
              aria-label={t('annotation.canvas.zoomIn', 'Zoom In')}
              title={`${t('annotation.canvas.zoomIn', 'Zoom In')} (+)`}
              className="annotation-toolbar-btn zoom"
            >
              <IconPlus size={20} />
            </button>
            <button
              onClick={onZoomOut}
              aria-label={t('annotation.canvas.zoomOut', 'Zoom Out')}
              title={`${t('annotation.canvas.zoomOut', 'Zoom Out')} (-)`}
              className="annotation-toolbar-btn zoom"
            >
              <IconMinus size={20} />
            </button>
            <button
              onClick={onResetView}
              aria-label={t('annotation.canvas.reset', 'Reset View')}
              title={`${t('annotation.canvas.resetViewTooltip', 'Reset View')} (0)`}
              className="annotation-toolbar-btn zoom"
            >
              <IconRefresh size={20} />
            </button>
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