import React from 'react';
import AnnotationWorkspace from '../../components/Annotation/AnnotationWorkspace';
import { useIsMobile } from '../../hooks/useIsMobile';

const Annotation = () => {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        height: '100%',
        paddingLeft: isMobile ? '8px' : '16px',
        paddingRight: isMobile ? '8px' : '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AnnotationWorkspace />
    </div>
  );
};

export default Annotation;
