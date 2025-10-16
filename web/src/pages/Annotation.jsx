import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AnnotationCanvas from '@/components/Canvas/AnnotationCanvas';
import AnnotationToolsToolbar from '@/components/Canvas/AnnotationToolsToolbar';
import LabelsPanel from '@/components/Canvas/LabelsPanel';

const Annotation = () => {
  const { id } = useParams();
  const [activeTool, setActiveTool] = useState('rectangle');
  const [zoom, setZoom] = useState(1);
  const canvasRef = { current: null };

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

  return (
    <div 
      className="h-full flex" 
      style={{ 
        overflow: 'hidden',
        minWidth: '800px',
        margin: '0',
        padding: '0'
      }}
    >
      {/* Tools Toolbar - Fixed 64px width */}
      <div style={{ flexShrink: 0, width: '64px' }}>
        <AnnotationToolsToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />
      </div>

      {/* Canvas Area - Flexible, takes remaining space */}
      <div
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        style={{
          minWidth: '400px',  // Minimum canvas width
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
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

      {/* Labels/Properties Panel - Fixed 250px minimum width */}
      <div style={{ flexShrink: 0, width: '250px', minWidth: '250px' }}>
        <LabelsPanel />
      </div>
    </div>
  );
};

export default Annotation;
