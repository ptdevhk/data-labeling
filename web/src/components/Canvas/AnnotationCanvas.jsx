import { useCallback, useEffect, useLayoutEffect, useRef, useImperativeHandle, useState } from 'react';
import { Canvas, Rect, Circle, Polygon, Line, FabricImage } from 'fabric';
import { useAnnotations } from '@/contexts/AnnotationContext';
import LabelAssignmentDialog from './LabelAssignmentDialog';

const AnnotationCanvas = ({ activeTool = 'select', canvasRef: parentCanvasRef, imagePath }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const drawingShapeRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const isDrawingRef = useRef(false);
  const activeToolRef = useRef(activeTool);
  const { addAnnotation, removeAnnotation, updateAnnotation } = useAnnotations();
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [pendingShape, setPendingShape] = useState(null);

  const MIN_RECT_SIZE = 5;

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const finalizeRectangle = useCallback((canvas, rectShape) => {
    const normalizedWidth = (rectShape.width || 0) * (rectShape.scaleX || 1);
    const normalizedHeight = (rectShape.height || 0) * (rectShape.scaleY || 1);

    if (normalizedWidth < MIN_RECT_SIZE || normalizedHeight < MIN_RECT_SIZE) {
      canvas.remove(rectShape);
      canvas.requestRenderAll();
      return;
    }

    // Show label assignment dialog
    setPendingShape({ canvas, shape: rectShape, type: 'rectangle' });
    setShowLabelDialog(true);
  }, []);

  const handleLabelAssigned = useCallback((labelId) => {
    if (!pendingShape) return;

    const { canvas, shape, type } = pendingShape;
    const normalizedWidth = (shape.width || 0) * (shape.scaleX || 1);
    const normalizedHeight = (shape.height || 0) * (shape.scaleY || 1);

    const annotation = addAnnotation({
      type,
      labelId,
      coordinates: {
        x: shape.left,
        y: shape.top,
        width: normalizedWidth,
        height: normalizedHeight,
      },
      meta: {
        stroke: shape.stroke,
        fill: shape.fill,
      },
    });

    shape.annotationId = annotation.id;
    shape.set({ name: annotation.id, selectable: true, evented: true, hasControls: true, hasBorders: true });
    shape.setCoords();
    canvas.requestRenderAll();

    setShowLabelDialog(false);
    setPendingShape(null);
  }, [pendingShape, addAnnotation]);

  const handleLabelSkipped = useCallback(() => {
    if (!pendingShape) return;

    const { canvas, shape } = pendingShape;
    canvas.remove(shape);
    canvas.requestRenderAll();

    setShowLabelDialog(false);
    setPendingShape(null);
  }, [pendingShape]);

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

    if (typeof window !== 'undefined') {
      window.__fabricCanvas = canvas;
    }

    // Add event handler for object modifications
    const handleObjectModified = (e) => {
      const target = e.target;
      if (target && target.annotationId) {
        const normalizedWidth = (target.width || 0) * (target.scaleX || 1);
        const normalizedHeight = (target.height || 0) * (target.scaleY || 1);

        updateAnnotation(target.annotationId, {
          coordinates: {
            x: target.left,
            y: target.top,
            width: normalizedWidth,
            height: normalizedHeight,
          },
        });
      }
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:moving', handleObjectModified);
    canvas.on('object:scaling', handleObjectModified);
    canvas.on('object:rotating', handleObjectModified);

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
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:moving', handleObjectModified);
      canvas.off('object:scaling', handleObjectModified);
      canvas.off('object:rotating', handleObjectModified);
      resizeObserver.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (typeof window !== 'undefined' && window.__fabricCanvas === canvas) {
        delete window.__fabricCanvas;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateAnnotation]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const handleMouseDown = (opt) => {
      const currentTool = activeToolRef.current;
      if (currentTool === 'select') {
        return;
      }

      if (currentTool === 'eraser') {
        const target = opt.target;
        if (target) {
          if (target.annotationId) {
            removeAnnotation(target.annotationId);
          }
          canvas.remove(target);
          canvas.requestRenderAll();
        }
        return;
      }

      const pointer = canvas.getPointer(opt.e);
      isDrawingRef.current = true;

      switch (currentTool) {
        case 'rectangle': {
          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#3B82F6',
            strokeWidth: 2,
            selectable: false,
            evented: false,
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
            selectable: false,
            evented: false,
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
              selectable: false,
              evented: false,
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
            selectable: false,
            evented: false,
          });
          canvas.add(line);
          drawingShapeRef.current = line;
          break;
        }
        default:
          break;
      }
    };

    const handleMouseMove = (opt) => {
      if (!isDrawingRef.current || !drawingShapeRef.current) {
        return;
      }

      const currentTool = activeToolRef.current;
      const pointer = canvas.getPointer(opt.e);
      const shape = drawingShapeRef.current;

      switch (currentTool) {
        case 'rectangle': {
          const width = pointer.x - shape.left;
          const height = pointer.y - shape.top;
          shape.set({ width: Math.abs(width), height: Math.abs(height) });
          if (width < 0) {
            shape.set({ left: pointer.x });
          }
          if (height < 0) {
            shape.set({ top: pointer.y });
          }
          shape.setCoords();
          break;
        }
        case 'circle': {
          const radius = Math.sqrt(
            Math.pow(pointer.x - shape.left, 2) + Math.pow(pointer.y - shape.top, 2)
          );
          shape.set({ radius });
          shape.setCoords();
          break;
        }
        case 'polygon': {
          const polygon = drawingShapeRef.current;
          if (polygon) {
            const points = polygon.points;
            points[points.length - 1].x = pointer.x;
            points[points.length - 1].y = pointer.y;
            polygon.set({ points });
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

      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      const shape = drawingShapeRef.current;
      const currentTool = activeToolRef.current;

      if (currentTool === 'polygon' && shape) {
        return;
      }

      if (shape) {
        switch (currentTool) {
          case 'rectangle':
            finalizeRectangle(canvas, shape);
            break;
          default:
            break;
        }
      }

      isDrawingRef.current = false;
      drawingShapeRef.current = null;
    };

    const handleDoubleClick = () => {
      const currentTool = activeToolRef.current;
      if (currentTool === 'polygon' && drawingShapeRef.current) {
        const polygon = drawingShapeRef.current;
        polygon.points.pop();
        polygon.set({ objectCaching: false });
        canvas.requestRenderAll();
        isDrawingRef.current = false;
        drawingShapeRef.current = null;
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDoubleClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDoubleClick);
    };
  }, [addAnnotation, finalizeRectangle, removeAnnotation]);

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
      const canvas = fabricCanvasRef.current;
      const isSelectionTool = activeTool === 'select';
      canvas.selection = isSelectionTool;

      if (isSelectionTool) {
        canvas.defaultCursor = 'default';
      } else if (activeTool === 'eraser') {
        canvas.defaultCursor = 'not-allowed';
      } else {
        canvas.defaultCursor = 'crosshair';
      }
    }
  }, [activeTool]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
      {/* Canvas */}
      <canvas ref={canvasRef} />
      
      {/* Label Assignment Dialog */}
      {showLabelDialog && (
        <LabelAssignmentDialog
          visible={showLabelDialog}
          onAssign={handleLabelAssigned}
          onSkip={handleLabelSkipped}
        />
      )}
    </div>
  );
};

export default AnnotationCanvas;
