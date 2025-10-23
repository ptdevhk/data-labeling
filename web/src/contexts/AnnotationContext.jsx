import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AnnotationContext = createContext(null);

export const AnnotationProvider = ({ children }) => {
  const [annotations, setAnnotations] = useState([]);

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
  }, []);

  const value = useMemo(
    () => ({
      annotations,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
    }),
    [annotations, addAnnotation, updateAnnotation, removeAnnotation]
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
