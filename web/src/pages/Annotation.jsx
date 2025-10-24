import { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnnotationCanvas from '@/components/Canvas/AnnotationCanvas';
import AnnotationToolsToolbar from '@/components/Canvas/AnnotationToolsToolbar';
import LabelsPanel from '@/components/Canvas/LabelsPanel';
import AnnotationListPanel from '@/components/Canvas/AnnotationListPanel';
import { AnnotationProvider } from '@/contexts/AnnotationContext';

const Annotation = () => {
  const { id } = useParams();
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  // Map project ID to sample images
  const imagePath = `/samples/image_${String(id).padStart(3, '0')}.jpg`;

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    if (canvasRef.current) {
      canvasRef.current.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    if (canvasRef.current) {
      canvasRef.current.setZoom(newZoom);
    }
  };

  const handleResetView = () => {
    setZoom(1);
    if (canvasRef.current) {
      canvasRef.current.resetView();
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
      <div className="h-full flex flex-col" style={{ minWidth: '1024px', backgroundColor: '#F8FAFC' }}>
        <header
          className="flex items-center justify-between"
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ margin: 0 }}>Annotation #{id}</h1>
            <p className="text-sm text-gray-500" style={{ margin: 0 }}>
              Image source: {imagePath}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #D1D5DB',
                backgroundColor: '#F9FAFB',
                color: '#9CA3AF',
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
                border: '1px solid #D1D5DB',
                backgroundColor: '#F9FAFB',
                color: '#9CA3AF',
                cursor: 'not-allowed',
              }}
            >
              Next
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside style={{ width: '260px', minWidth: '240px' }}>
            <LabelsPanel />
          </aside>

          <div className="flex-1 flex overflow-hidden" style={{ padding: '1rem', gap: '1rem' }}>
            <div style={{ width: '72px', flexShrink: 0 }}>
              <AnnotationToolsToolbar
                activeTool={activeTool}
                onToolChange={handleToolChange}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
              />
            </div>
            <div
              className="flex-1 bg-white rounded-xl shadow-sm"
              style={{
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
              }}
            >
              <AnnotationCanvas
                activeTool={activeTool}
                canvasRef={canvasRef}
                zoom={zoom}
                setZoom={setZoom}
                imagePath={imagePath}
              />
            </div>
            <aside style={{ width: '300px', minWidth: '280px' }}>
              <AnnotationListPanel />
            </aside>
          </div>
        </div>
      </div>
    </AnnotationProvider>
  );
};

export default Annotation;
