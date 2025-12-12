import React from 'react';
import AnnotationCanvas from './AnnotationCanvas';
import AnnotationExportDialog from './AnnotationExportDialog';
import { useAnnotationData } from '../../hooks/annotation/useAnnotationData';

const AnnotationWorkspace = () => {
  const annotationData = useAnnotationData();

  const {
    // State
    loading,
    resolvedTheme,
    exportDialogVisible,
    labels,

    // Handlers
    handleExit,
    handleSave,
    handleNextImage,
    handlePrevImage,
    handleExport,
    handleImageLoad,
    openExportDialog,
    closeExportDialog,

    // Data
    getCurrentImage,
    getAnnotatorLanguage,
    getExportAnnotationCount,

    // i18n
    t,
  } = annotationData;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-semi-text-2">
          {t('annotation.loading', 'Loading annotations...')}
        </div>
      </div>
    );
  }

  return (
    <>
      <AnnotationCanvas
        image={getCurrentImage()}
        theme={resolvedTheme}
        language={getAnnotatorLanguage()}
        onExit={handleExit}
        onSave={handleSave}
        onNextImage={handleNextImage}
        onPrevImage={handlePrevImage}
        onExport={openExportDialog}
        onImageLoad={handleImageLoad}
        t={t}
      />

      <AnnotationExportDialog
        visible={exportDialogVisible}
        onCancel={closeExportDialog}
        onExport={handleExport}
        annotationCount={getExportAnnotationCount()}
        labelCount={labels.length}
        t={t}
      />
    </>
  );
};

export default AnnotationWorkspace;
