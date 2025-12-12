import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import packageJson from '../../package.json';

const DEFAULT_LABELS = [
  { id: 'label-1', name: 'Defect1', color: '#3B82F6' },
  { id: 'label-2', name: 'Defect2', color: '#10B981' },
  { id: 'label-3', name: 'Defect3', color: '#EF4444' },
];

const AnnotationContext = createContext(null);

// Helper to convert our annotations to AnyLabeling format
const toAnyLabelingShape = (annotation, labels) => {
  const label = labels.find(l => l.id === annotation.labelId);
  const shape = {
    label: label?.name || '',
    text: annotation.meta?.text || '',
    points: [],
    group_id: annotation.meta?.group_id || null,
    shape_type: annotation.type,
    flags: annotation.meta?.flags || {},
  };

  // Convert coordinates to points array
  const coords = annotation.coordinates;
  if (annotation.type === 'rectangle') {
    const { left, top, width, height } = coords;
    shape.points = [
      [left, top],
      [left + width, top + height],
    ];
  } else if (annotation.type === 'polygon' && coords.points) {
    shape.points = coords.points.map(pt => [pt.x, pt.y]);
  } else if (annotation.type === 'circle') {
    const { centerX, centerY, radius } = coords;
    shape.points = [[centerX, centerY], [centerX + radius, centerY]];
  } else if (annotation.type === 'line' && coords.x1 !== undefined) {
    shape.points = [[coords.x1, coords.y1], [coords.x2, coords.y2]];
  }

  return shape;
};

// Helper to convert AnyLabeling shape back to our format
const fromAnyLabelingShape = (shape, labels) => {
  const label = labels.find(l => l.name === shape.label);
  const annotation = {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: shape.shape_type,
    labelId: label?.id || null,
    coordinates: {},
    createdAt: new Date().toISOString(),
    meta: {
      text: shape.text || '',
      group_id: shape.group_id,
      flags: shape.flags || {},
    },
  };

  // Convert points back to coordinates
  const points = shape.points;
  if (shape.shape_type === 'rectangle' && points.length === 2) {
    const [[x1, y1], [x2, y2]] = points;
    annotation.coordinates = {
      left: Math.min(x1, x2),
      top: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  } else if (shape.shape_type === 'polygon') {
    annotation.coordinates = {
      points: points.map(([x, y]) => ({ x, y })),
    };
  } else if (shape.shape_type === 'circle' && points.length === 2) {
    const [[cx, cy], [px, py]] = points;
    const radius = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    annotation.coordinates = {
      centerX: cx,
      centerY: cy,
      radius,
    };
  } else if (shape.shape_type === 'line' && points.length === 2) {
    const [[x1, y1], [x2, y2]] = points;
    annotation.coordinates = { x1, y1, x2, y2 };
  }

  return annotation;
};

export const AnnotationProvider = ({ children, imageId, imagePath, imageWidth, imageHeight }) => {
  const storageKey = `annotation-${imageId}`;
  
  // Initialize state with localStorage data using lazy initializer
  const [annotations, setAnnotations] = useState(() => {
    if (!imageId) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Convert from AnyLabeling format
        if (data.shapes && Array.isArray(data.shapes)) {
          return data.shapes.map(shape => fromAnyLabelingShape(shape, DEFAULT_LABELS));
        }
      }
    } catch (error) {
      console.error('Failed to load annotations from localStorage:', error);
    }
    return [];
  });
  
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  
  const [lastSavedAt, setLastSavedAt] = useState(() => {
    if (!imageId) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        return data.version ? new Date() : null;
      }
    } catch (error) {
      console.error('Failed to load savedAt from localStorage:', error);
    }
    return null;
  });
  
  const [activeLabelId, setActiveLabelId] = useState(DEFAULT_LABELS[0]?.id ?? null);
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const saveTimeoutRef = useRef(null);

  // Define saveToLocalStorage using AnyLabeling format
  const saveToLocalStorage = useCallback(() => {
    if (!imageId || !imagePath) return;

    try {
      // Convert to AnyLabeling format
      const shapes = annotations.map(ann => toAnyLabelingShape(ann, labels));
      
      const data = {
        version: packageJson.version,
        flags: {},
        shapes,
        imagePath: imagePath.split('/').pop(), // Just filename
        imageData: null,
        imageHeight: imageHeight || null,
        imageWidth: imageWidth || null,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data, null, 2));
      setIsDirty(false);
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [annotations, labels, imageId, imagePath, imageWidth, imageHeight, storageKey]);

  // Auto-save with debouncing (3 seconds after last change)
  useEffect(() => {
    if (!isDirty || !autoSaveEnabled) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [annotations, labels, isDirty, autoSaveEnabled, saveToLocalStorage]);

  const saveToBackend = useCallback(async () => {
    if (!imageId) return;

    try {
      console.log('Backend save not yet implemented');
      setIsDirty(false);
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Failed to save to backend:', error);
    }
  }, [imageId]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const addAnnotation = useCallback((annotation) => {
    const generatedId =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const id = annotation.id || generatedId;
    const record = {
      id,
      type: annotation.type,
      labelId: annotation.labelId ?? null,
      coordinates: annotation.coordinates,
      createdAt: annotation.createdAt ?? new Date().toISOString(),
      meta: annotation.meta ?? {},
    };
    setAnnotations((prev) => [...prev, record]);
    markDirty();
    return record;
  }, [markDirty]);

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.id === id ? { ...annotation, ...updates } : annotation
      )
    );
    markDirty();
  }, [markDirty]);

  const removeAnnotation = useCallback((id) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
    setActiveAnnotationId((current) => (current === id ? null : current));
    markDirty();
  }, [markDirty]);

  const addLabel = useCallback((label) => {
    const generatedId =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const id = label.id || generatedId;
    const record = { id, name: label.name, color: label.color ?? '#3B82F6' };
    setLabels((prev) => [...prev, record]);
    markDirty();
    return record;
  }, [markDirty]);

  const updateLabel = useCallback((id, updates) => {
    setLabels((prev) => prev.map((label) => (label.id === id ? { ...label, ...updates } : label)));
    markDirty();
  }, [markDirty]);

  const removeLabel = useCallback((id) => {
    setLabels((prev) => prev.filter((label) => label.id !== id));
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.labelId === id ? { ...annotation, labelId: null } : annotation,
      ),
    );
    setActiveLabelId((current) => (current === id ? null : current));
    markDirty();
  }, [markDirty]);

  const selectAnnotation = useCallback((id) => {
    setActiveAnnotationId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setActiveAnnotationId(null);
  }, []);

  const clearAllAnnotations = useCallback(() => {
    setAnnotations([]);
    setActiveAnnotationId(null);
    markDirty();
  }, [markDirty]);

  const value = useMemo(
    () => ({
      annotations,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      clearAllAnnotations,
      labels,
      addLabel,
      updateLabel,
      removeLabel,
      activeLabelId,
      setActiveLabelId,
      activeAnnotationId,
      selectAnnotation,
      clearSelection,
      isDirty,
      lastSavedAt,
      autoSaveEnabled,
      setAutoSaveEnabled,
      saveToLocalStorage,
      saveToBackend,
    }),
    [
      annotations,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      clearAllAnnotations,
      labels,
      addLabel,
      updateLabel,
      removeLabel,
      activeLabelId,
      activeAnnotationId,
      selectAnnotation,
      clearSelection,
      isDirty,
      lastSavedAt,
      autoSaveEnabled,
      saveToLocalStorage,
      saveToBackend,
    ],
  );

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnnotations = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
};
