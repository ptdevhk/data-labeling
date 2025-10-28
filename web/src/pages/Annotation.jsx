import { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnnotationCanvas from '@/components/Canvas/AnnotationCanvas';
import AnnotationToolsToolbar from '@/components/Canvas/AnnotationToolsToolbar';
import LabelsPanel from '@/components/Canvas/LabelsPanel';
import AnnotationListPanel from '@/components/Canvas/AnnotationListPanel';
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import { useTranslation } from 'react-i18next';

const Annotation = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [zoomMode, setZoomMode] = useState('FIT_WIDTH'); // FIT_WINDOW, FIT_WIDTH, MANUAL_ZOOM
  const canvasRef = useRef(null);

  // Map project ID to sample images
  const imagePath = `/samples/image_${String(id).padStart(3, '0')}.jpg`;

  const handleZoomIn = () => {
    setZoomMode('MANUAL_ZOOM'); // Switch to manual mode when user zooms
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    if (canvasRef.current) {
      canvasRef.current.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    setZoomMode('MANUAL_ZOOM'); // Switch to manual mode when user zooms
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    if (canvasRef.current) {
      canvasRef.current.setZoom(newZoom);
    }
  };

  const handleResetView = () => {
    setZoomMode('MANUAL_ZOOM');
    setZoom(1);
    if (canvasRef.current) {
      canvasRef.current.resetView();
    }
  };

  const handleToggleFitWidth = () => {
    if (zoomMode === 'FIT_WIDTH') {
      // Switch to MANUAL mode with 100% zoom and centered image
      setZoomMode('MANUAL_ZOOM');
      setZoom(1);
      if (canvasRef.current) {
        canvasRef.current.resetToCenter();
      }
    } else {
      // Switch to FIT_WIDTH mode - let useEffect in AnnotationCanvas handle the adjust
      setZoomMode('FIT_WIDTH');
    }
  };

  const handleToolChange = useCallback((toolKey) => {
    // Tools that change drawing interaction on the canvas
    const drawableTools = new Set([
      'select',
      'rectangle',
      'circle',
      'polygon',
      'line',
      'point',
      'eraser',
    ]);

    if (drawableTools.has(toolKey)) {
      setActiveTool(toolKey);
      return;
    }

    // Action tools (undo/redo etc.) will be implemented later
    switch (toolKey) {
      case 'undo':
      case 'redo':
        console.info(`Action "${toolKey}" is not implemented yet.`);
        break;
      default:
        console.warn(`Unhandled tool action: ${toolKey}`);
    }
  }, [setActiveTool]);

  return (
    <AnnotationProvider>
      <div className="flex flex-col h-full" style={{ minWidth: '1024px', backgroundColor: 'var(--semi-color-bg-0)', overflow: 'hidden' }}>
        <div className="flex flex-1" style={{ padding: '1.5rem', backgroundColor: 'var(--semi-color-bg-0)', minHeight: 0 }}>
          <div
            className="flex-1 flex overflow-hidden"
            style={{
              borderRadius: '1rem',
              border: '1px solid var(--semi-color-border)',
              backgroundColor: 'var(--semi-color-bg-1)',
              boxShadow: 'var(--semi-shadow-elevated)',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <header
              className="flex items-center justify-between"
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--semi-color-border)',
                backgroundColor: 'var(--semi-color-bg-1)',
              }}
            >
              <div>
                <h1 className="text-xl font-semibold" style={{ margin: 0 }}>{t('annotation.page.title', { id })}</h1>
                <p className="text-sm" style={{ margin: 0, color: 'var(--semi-color-text-2)' }}>
                  {t('annotation.page.imageSource', { path: imagePath })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--semi-color-border)',
                    backgroundColor: 'var(--semi-color-fill-0)',
                    color: 'var(--semi-color-text-3)',
                    cursor: 'not-allowed',
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--semi-color-border)',
                    backgroundColor: 'var(--semi-color-fill-0)',
                    color: 'var(--semi-color-text-3)',
                    cursor: 'not-allowed',
                  }}
                >
                  Next
                </button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
              <aside style={{ width: '260px', minWidth: '240px', height: '100%', borderRight: '1px solid var(--semi-color-border)', overflow: 'hidden' }}>
                <LabelsPanel />
              </aside>

              <div className="flex-1 flex overflow-hidden" style={{ padding: '1rem', gap: '1rem', minHeight: 0 }}>
                <div style={{ width: '72px', flexShrink: 0 }}>
                  <AnnotationToolsToolbar
                    activeTool={activeTool}
                    onToolChange={handleToolChange}
                    zoom={zoom}
                    zoomMode={zoomMode}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetView={handleResetView}
                    onToggleFitWidth={handleToggleFitWidth}
                  />
                </div>
                <div
                  className="flex-1"
                  style={{
                    overflow: 'auto',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--semi-color-border)',
                    backgroundColor: 'var(--semi-color-bg-0)',
                    minHeight: 0,
                  }}
                >
                  <AnnotationCanvas
                    activeTool={activeTool}
                    canvasRef={canvasRef}
                    zoom={zoom}
                    setZoom={setZoom}
                    zoomMode={zoomMode}
                    imagePath={imagePath}
                  />
                </div>
                <aside style={{ width: '300px', minWidth: '280px', height: '100%', borderLeft: '1px solid var(--semi-color-border)', overflow: 'hidden' }}>
                  <AnnotationListPanel />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnnotationProvider>
  );
};

export default Annotation;
