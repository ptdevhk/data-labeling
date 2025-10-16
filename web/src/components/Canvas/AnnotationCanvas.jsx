import { useEffect, useLayoutEffect, useRef, useState, useImperativeHandle } from 'react';
import { Canvas, Rect, Circle, Polygon, Line, FabricImage } from 'fabric';

const AnnotationCanvas = ({ activeTool = 'select', canvasRef: parentCanvasRef, imagePath }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingShapeRef = useRef(null);
  const backgroundImageRef = useRef(null);

  // Expose methods to parent
  useImperativeHandle(parentCanvasRef, () => ({
    setZoom: (newZoom) => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setZoom(newZoom);
        fabricCanvasRef.current.renderAll();
      }
    },
    resetView: () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setZoom(1);
        fabricCanvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0];
        fabricCanvasRef.current.renderAll();
      }
    }
  }));

  // Function to resize and reposition background image
  const resizeBackgroundImage = (canvas) => {
    if (backgroundImageRef.current && canvas) {
      const img = backgroundImageRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate scale to fit the image to the canvas
      const scale = Math.min(
        canvasWidth / imgWidth,
        canvasHeight / imgHeight
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
      });

      // Center the image
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
      });

      canvas.renderAll();
    }
  };

  // Use useLayoutEffect for initial setup to ensure DOM is ready
  useLayoutEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const parent = canvasRef.current.parentElement;
    const initialWidth = parent.clientWidth || 800;
    const initialHeight = parent.clientHeight || 600;

    // Initialize Fabric.js canvas
    const canvas = new Canvas(canvasRef.current, {
      width: initialWidth,
      height: initialHeight,
      backgroundColor: '#f5f5f5',
      selection: activeTool === 'select',
    });

    fabricCanvasRef.current = canvas;

    // Use ResizeObserver to watch the parent container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.setWidth(width);
          canvas.setHeight(height);
          resizeBackgroundImage(canvas);
        }
      }
    });

    // Observe the parent element
    resizeObserver.observe(parent);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle image loading separately
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imagePath) return;

    // Clear previous background image
    if (backgroundImageRef.current) {
      canvas.backgroundImage = null;
      backgroundImageRef.current = null;
    }

    // Load background image
    FabricImage.fromURL(imagePath)
      .then((img) => {
        img.set({
          selectable: false,
          evented: false,
        });

        // In Fabric.js v6, assign backgroundImage directly instead of using setBackgroundImage
        canvas.backgroundImage = img;
        backgroundImageRef.current = img;

        // Initial sizing
        resizeBackgroundImage(canvas);
      })
      .catch((err) => {
        console.error('Error loading image:', err);
        console.error('Image path:', imagePath);
        console.error('Error details:', err.message, err.stack);
      });
  }, [imagePath]);

  // Update canvas selection mode when tool changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.selection = activeTool === 'select';
      fabricCanvasRef.current.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair';
    }
  }, [activeTool]);

  // Handle mouse down for drawing
  const handleMouseDown = (event) => {
    if (activeTool === 'select') return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(event.e);
    setIsDrawing(true);

    switch (activeTool) {
      case 'rectangle': {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'rgba(59, 130, 246, 0.3)',
          stroke: '#3B82F6',
          strokeWidth: 2,
        });
        canvas.add(rect);
        drawingShapeRef.current = rect;
        break;
      }
      case 'circle': {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'rgba(16, 185, 129, 0.3)',
          stroke: '#10B981',
          strokeWidth: 2,
        });
        canvas.add(circle);
        drawingShapeRef.current = circle;
        break;
      }
      case 'polygon': {
        if (!drawingShapeRef.current) {
          const polygon = new Polygon([pointer], {
            fill: 'rgba(239, 68, 68, 0.3)',
            stroke: '#EF4444',
            strokeWidth: 2,
            objectCaching: false,
          });
          canvas.add(polygon);
          drawingShapeRef.current = polygon;
        } else {
          const polygon = drawingShapeRef.current;
          polygon.points.push(pointer);
        }
        break;
      }
      case 'line': {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#F59E0B',
          strokeWidth: 2,
        });
        canvas.add(line);
        drawingShapeRef.current = line;
        break;
      }
      default:
        break;
    }
  };

  // Handle mouse move for drawing
  const handleMouseMove = (event) => {
    if (!isDrawing || !drawingShapeRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(event.e);
    const shape = drawingShapeRef.current;

    switch (activeTool) {
      case 'rectangle': {
        const width = pointer.x - shape.left;
        const height = pointer.y - shape.top;
        shape.set({ width: Math.abs(width), height: Math.abs(height) });
        if (width < 0) shape.set({ left: pointer.x });
        if (height < 0) shape.set({ top: pointer.y });
        break;
      }
      case 'circle': {
        const radius = Math.sqrt(
          Math.pow(pointer.x - shape.left, 2) + Math.pow(pointer.y - shape.top, 2)
        );
        shape.set({ radius });
        break;
      }
      case 'polygon': {
        const polygon = drawingShapeRef.current;
        if (polygon) {
          const points = polygon.points;
          points[points.length - 1].x = pointer.x;
          points[points.length - 1].y = pointer.y;
          polygon.set({
            points: points,
          });
        }
        break;
      }
      case 'line': {
        shape.set({ x2: pointer.x, y2: pointer.y });
        break;
      }
      default:
        break;
    }

    canvas.renderAll();
  };

  // Handle mouse up for drawing
  const handleMouseUp = () => {
    if (activeTool === 'polygon' && drawingShapeRef.current) {
      // For polygons, don't finish drawing on mouse up
      return;
    }
    setIsDrawing(false);
    drawingShapeRef.current = null;
  };

  // Handle double click for finishing polygon
  const handleDoubleClick = () => {
    if (activeTool === 'polygon' && drawingShapeRef.current) {
      const canvas = fabricCanvasRef.current;
      const polygon = drawingShapeRef.current;
      // Remove the last point, which is the same as the first point
      polygon.points.pop();
      polygon.set({
        objectCaching: false,
      });
      canvas.renderAll();
      setIsDrawing(false);
      drawingShapeRef.current = null;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};

export default AnnotationCanvas;
