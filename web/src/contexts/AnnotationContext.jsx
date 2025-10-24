import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DEFAULT_LABELS = [
  { id: 'label-1', name: 'Defect1', color: '#3B82F6' },
  { id: 'label-2', name: 'Defect2', color: '#10B981' },
  { id: 'label-3', name: 'Defect3', color: '#EF4444' },
];

const AnnotationContext = createContext(null);

export const AnnotationProvider = ({ children }) => {
  const [annotations, setAnnotations] = useState([]);
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [activeLabelId, setActiveLabelId] = useState(DEFAULT_LABELS[0]?.id ?? null);
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);

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
    return record;
  }, []);

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.id === id ? { ...annotation, ...updates } : annotation
      )
    );
  }, []);

  const removeAnnotation = useCallback((id) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
    setActiveAnnotationId((current) => (current === id ? null : current));
  }, []);

  const addLabel = useCallback((label) => {
    const generatedId =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const id = label.id || generatedId;
    const record = { id, name: label.name, color: label.color ?? '#3B82F6' };
    setLabels((prev) => [...prev, record]);
    return record;
  }, []);

  const updateLabel = useCallback((id, updates) => {
    setLabels((prev) => prev.map((label) => (label.id === id ? { ...label, ...updates } : label)));
  }, []);

  const removeLabel = useCallback((id) => {
    setLabels((prev) => prev.filter((label) => label.id !== id));
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.labelId === id ? { ...annotation, labelId: null } : annotation,
      ),
    );
    setActiveLabelId((current) => (current === id ? null : current));
  }, []);

  const selectAnnotation = useCallback((id) => {
    setActiveAnnotationId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setActiveAnnotationId(null);
  }, []);

  const value = useMemo(
    () => ({
      annotations,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      labels,
      addLabel,
      updateLabel,
      removeLabel,
      activeLabelId,
      setActiveLabelId,
      activeAnnotationId,
      selectAnnotation,
      clearSelection,
    }),
    [
      annotations,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      labels,
      addLabel,
      updateLabel,
      removeLabel,
      activeLabelId,
      activeAnnotationId,
      selectAnnotation,
      clearSelection,
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
