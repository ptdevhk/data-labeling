import { useCallback, useEffect, useLayoutEffect, useRef, useImperativeHandle, useState } from 'react';
import { Canvas, Rect, FabricImage } from 'fabric';
import { useAnnotations } from '@/contexts/AnnotationContext';
import LabelAssignmentDialog from './LabelAssignmentDialog';

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) {
    return `rgba(59, 130, 246, ${alpha})`;
  }

  let parsed = hex.replace('#', '');
  if (parsed.length === 3) {
    parsed = parsed
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }

  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const AnnotationCanvas = ({ activeTool = 'select', canvasRef: parentCanvasRef, imagePath }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const drawingShapeRef = useRef(null);
  const startPointRef = useRef({ x: 0, y: 0 });
  const backgroundImageRef = useRef(null);
  const isDrawingRef = useRef(false);
  const activeToolRef = useRef(activeTool);
  const {
    annotations,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    labels,
    activeLabelId,
    setActiveLabelId,
    activeAnnotationId,
    selectAnnotation,
    clearSelection,
  } = useAnnotations();
  const shapeRegistryRef = useRef(new Map());
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [pendingShape, setPendingShape] = useState(null);

  const MIN_RECT_SIZE = 5;

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const computeDimension = (shape, axis) => {
    const dimension = shape[axis] ?? 0;
    const scale = axis === 'width' ? (shape.scaleX ?? 1) : (shape.scaleY ?? 1);
    const scaledDimension = Math.abs(dimension * scale);
    if (scaledDimension > 0) {
      return scaledDimension;
    }

    if (axis === 'width' && typeof shape.getScaledWidth === 'function') {
      const fallback = Math.abs(shape.getScaledWidth() ?? 0);
      if (fallback > 0) {
        return fallback;
      }
    }

    if (axis === 'height' && typeof shape.getScaledHeight === 'function') {
      const fallback = Math.abs(shape.getScaledHeight() ?? 0);
      if (fallback > 0) {
        return fallback;
      }
    }

    const bounds = shape.getBoundingRect?.(true, true);
    if (bounds) {
      const boundDimension = axis === 'width' ? bounds.width : bounds.height;
      if (boundDimension && boundDimension > 0) {
        return boundDimension;
      }
    }

    return 0;
  };

  const finalizeRectangle = useCallback((canvas, rectShape) => {
    const normalizedWidth = computeDimension(rectShape, 'width');
    const normalizedHeight = computeDimension(rectShape, 'height');

    if (normalizedWidth < MIN_RECT_SIZE || normalizedHeight < MIN_RECT_SIZE) {
      canvas.remove(rectShape);
      canvas.requestRenderAll();
      return;
    }

    if (activeLabelId) {
      const activeLabel = labels.find((label) => label.id === activeLabelId);
      const strokeColor = activeLabel?.color ?? '#3B82F6';
      rectShape.set({
        stroke: strokeColor,
        fill: hexToRgba(strokeColor, 0.16),
        width: normalizedWidth,
        height: normalizedHeight,
        scaleX: 1,
        scaleY: 1,
        originX: 'left',
        originY: 'top',
      });

      const annotation = addAnnotation({
        type: 'rectangle',
        labelId: activeLabelId,
        coordinates: {
          x: rectShape.left,
          y: rectShape.top,
          width: normalizedWidth,
          height: normalizedHeight,
        },
        meta: {
          stroke: strokeColor,
          fill: hexToRgba(strokeColor, 0.16),
        },
      });
      rectShape.annotationId = annotation.id;

      // Determine selectability based on current tool
      const currentTool = activeToolRef.current;
      const isSelectionTool = currentTool === 'select';
      const shouldBeSelectable = isSelectionTool || currentTool === 'eraser';

      rectShape.set({
        name: annotation.id,
        selectable: shouldBeSelectable,
        evented: shouldBeSelectable,
        hasControls: shouldBeSelectable,
        hasBorders: shouldBeSelectable,
      });
      rectShape.setCoords();
      shapeRegistryRef.current.set(annotation.id, rectShape);

      // Only select and activate if in select mode
      if (isSelectionTool) {
        selectAnnotation(annotation.id);
        canvas.setActiveObject(rectShape);
      }

      canvas.requestRenderAll();
      return;
    }

    setPendingShape({ canvas, shape: rectShape, type: 'rectangle' });
    setShowLabelDialog(true);
  }, [activeLabelId, addAnnotation, labels, selectAnnotation]);

  const handleLabelAssigned = useCallback((labelId) => {
    if (!pendingShape) return;

    const { canvas, shape, type } = pendingShape;
    const normalizedWidth = computeDimension(shape, 'width');
    const normalizedHeight = computeDimension(shape, 'height');
    const assignedLabel = labels.find((label) => label.id === labelId);
    const strokeColor = assignedLabel?.color ?? '#3B82F6';

    shape.set({
      stroke: strokeColor,
      fill: hexToRgba(strokeColor, 0.16),
    });

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
        stroke: strokeColor,
        fill: hexToRgba(strokeColor, 0.16),
      },
    });

    shape.annotationId = annotation.id;

    // Determine selectability based on current tool
    const currentTool = activeToolRef.current;
    const isSelectionTool = currentTool === 'select';
    const shouldBeSelectable = isSelectionTool || currentTool === 'eraser';

    shape.set({
      name: annotation.id,
      selectable: shouldBeSelectable,
      evented: shouldBeSelectable,
      hasControls: shouldBeSelectable,
      hasBorders: shouldBeSelectable,
      width: normalizedWidth,
      height: normalizedHeight,
      scaleX: 1,
      scaleY: 1,
      originX: 'left',
      originY: 'top',
    });
    shape.setCoords();
    shapeRegistryRef.current.set(annotation.id, shape);
    setActiveLabelId(labelId);

    // Only select and activate if in select mode
    if (isSelectionTool) {
      selectAnnotation(annotation.id);
      canvas.setActiveObject(shape);
    }

    canvas.requestRenderAll();

    setShowLabelDialog(false);
    setPendingShape(null);
  }, [addAnnotation, labels, pendingShape, selectAnnotation, setActiveLabelId]);

  const handleLabelSkipped = useCallback(() => {
    if (!pendingShape) return;

    const { canvas, shape } = pendingShape;
    canvas.remove(shape);
    if (shape.annotationId) {
      shapeRegistryRef.current.delete(shape.annotationId);
    }
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

    const handleSelection = (e) => {
      const target = e.selected && e.selected[0];
      if (target && target.annotationId) {
        selectAnnotation(target.annotationId);
      }
    };

    const handleSelectionCleared = () => {
      clearSelection();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);

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

    const shapesRef = shapeRegistryRef.current;

    // Cleanup
    return () => {
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:moving', handleObjectModified);
      canvas.off('object:scaling', handleObjectModified);
      canvas.off('object:rotating', handleObjectModified);
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelectionCleared);
      resizeObserver.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (typeof window !== 'undefined' && window.__fabricCanvas === canvas) {
        delete window.__fabricCanvas;
      }
      shapesRef.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSelection, selectAnnotation, updateAnnotation]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const handleMouseDown = (opt) => {
      const currentTool = activeToolRef.current;
      if (currentTool === 'select') {
        const target = opt.target;
        if (target && target.annotationId) {
          selectAnnotation(target.annotationId);
        } else {
          clearSelection();
        }
        return;
      }

      if (currentTool === 'eraser') {
        const target = opt.target;
        if (target) {
          if (target.annotationId) {
            removeAnnotation(target.annotationId);
          }
          canvas.remove(target);
          if (target.annotationId) {
            shapeRegistryRef.current.delete(target.annotationId);
          }
          canvas.requestRenderAll();
        }
        return;
      }

      if (currentTool !== 'rectangle') {
        return;
      }

      const pointer = canvas.getPointer(opt.e);
      isDrawingRef.current = true;
      startPointRef.current = { x: pointer.x, y: pointer.y };

      // Get current label color or default to blue
      const activeLabel = labels.find((label) => label.id === activeLabelId);
      const strokeColor = activeLabel?.color ?? '#3B82F6';

      const rect = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        fill: hexToRgba(strokeColor, 0.16),
        stroke: strokeColor,
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      canvas.add(rect);
      drawingShapeRef.current = rect;
    };

    const handleMouseMove = (opt) => {
      if (!isDrawingRef.current || !drawingShapeRef.current) {
        return;
      }

      const pointer = canvas.getPointer(opt.e);
      const shape = drawingShapeRef.current;
      const origin = startPointRef.current;
      const width = pointer.x - origin.x;
      const height = pointer.y - origin.y;
      const left = width >= 0 ? origin.x : origin.x + width;
      const top = height >= 0 ? origin.y : origin.y + height;
      const normalizedWidth = Math.abs(width);
      const normalizedHeight = Math.abs(height);

      shape.set({
        left,
        top,
        width: normalizedWidth || 1,
        height: normalizedHeight || 1,
        scaleX: 1,
        scaleY: 1,
        originX: 'left',
        originY: 'top',
      });
      shape.setCoords();

      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      const shape = drawingShapeRef.current;
      const currentTool = activeToolRef.current;

      if (shape && currentTool === 'rectangle') {
        finalizeRectangle(canvas, shape);
      }

      isDrawingRef.current = false;
      drawingShapeRef.current = null;
    };

    const handleDoubleClick = () => {
      isDrawingRef.current = false;
      drawingShapeRef.current = null;
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
  }, [activeLabelId, clearSelection, finalizeRectangle, labels, removeAnnotation, selectAnnotation]);

  // Update drawing shape color when active label changes mid-draw
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // If currently drawing and label changes, update the drawing shape's color
    if (isDrawingRef.current && drawingShapeRef.current) {
      const activeLabel = labels.find((label) => label.id === activeLabelId);
      const strokeColor = activeLabel?.color ?? '#3B82F6';

      drawingShapeRef.current.set({
        stroke: strokeColor,
        fill: hexToRgba(strokeColor, 0.16),
      });

      canvas.requestRenderAll();
    }
  }, [activeLabelId, labels]);

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

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const annotationIds = new Set(annotations.map((annotation) => annotation.id));

    shapeRegistryRef.current.forEach((shape, id) => {
      if (!annotationIds.has(id)) {
        canvas.remove(shape);
        shapeRegistryRef.current.delete(id);
      }
    });

    // Determine if objects should be selectable based on current tool
    const isSelectionTool = activeTool === 'select';
    const shouldBeSelectable = isSelectionTool || activeTool === 'eraser';

    annotations.forEach((annotation) => {
      if (annotation.type !== 'rectangle') {
        return;
      }

      if (!shapeRegistryRef.current.has(annotation.id)) {
        const rect = new Rect({
          left: annotation.coordinates.x,
          top: annotation.coordinates.y,
          width: annotation.coordinates.width,
          height: annotation.coordinates.height,
          fill: annotation.meta?.fill ?? 'rgba(59, 130, 246, 0.16)',
          stroke: annotation.meta?.stroke ?? '#3B82F6',
          strokeWidth: 2,
          selectable: shouldBeSelectable,
          evented: shouldBeSelectable,
          originX: 'left',
          originY: 'top',
        });
        rect.annotationId = annotation.id;
        rect.setCoords();
        canvas.add(rect);
        shapeRegistryRef.current.set(annotation.id, rect);
      }
    });

    canvas.requestRenderAll();
  }, [annotations, activeTool]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let activeShape = null;

    annotations.forEach((annotation) => {
      const shape = shapeRegistryRef.current.get(annotation.id);
      if (!shape) {
        return;
      }

      const label = labels.find((item) => item.id === annotation.labelId);
      const baseColor = label?.color ?? '#3B82F6';
      const isActive = annotation.id === activeAnnotationId;

      shape.set({
        stroke: baseColor,
        strokeWidth: isActive ? 3 : 2,
        fill: isActive ? hexToRgba(baseColor, 0.24) : hexToRgba(baseColor, 0.16),
        opacity: 1,
      });

      if (isActive) {
        activeShape = shape;
      }
    });

    if (activeShape) {
      canvas.setActiveObject(activeShape);
      if (typeof canvas.bringToFront === 'function') {
        canvas.bringToFront(activeShape);
      }
    } else {
      canvas.discardActiveObject();
    }

    canvas.requestRenderAll();
  }, [activeAnnotationId, annotations, labels]);

  // Update canvas selection mode when tool changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const isSelectionTool = activeTool === 'select';
      canvas.selection = isSelectionTool;

      // Update all existing objects' selectability based on current tool
      canvas.getObjects().forEach((obj) => {
        if (obj.annotationId) {
          // Objects should only be selectable in select or eraser mode
          const shouldBeSelectable = isSelectionTool || activeTool === 'eraser';
          obj.set({
            selectable: shouldBeSelectable,
            evented: shouldBeSelectable,
          });
        }
      });

      if (isSelectionTool) {
        canvas.defaultCursor = 'default';
      } else if (activeTool === 'eraser') {
        canvas.defaultCursor = 'not-allowed';
      } else {
        canvas.defaultCursor = 'crosshair';
      }

      // Clear active object when switching away from select mode
      if (!isSelectionTool) {
        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();
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
