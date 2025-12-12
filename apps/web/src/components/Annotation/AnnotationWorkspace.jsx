import React from 'react';
import CardPro from '../common/ui/CardPro';
// import AnnotationDescription from './AnnotationDescription';
// import AnnotationActions from './AnnotationActions';
import AnnotationCanvas from './AnnotationCanvas';
import { useAnnotationData } from '../../hooks/annotation/useAnnotationData';

const AnnotationWorkspace = () => {
  const annotationData = useAnnotationData();

  const {
    // State
    loading,
    // currentImageIndex,
    // totalImages,
    resolvedTheme,

    // Handlers
    handleExit,
    handleNextImage,
    handlePrevImage,
    // saveAnnotations,

    // Data
    getCurrentImage,
    getAnnotatorLanguage,

    // i18n
    t,
  } = annotationData;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full py-20'>
        <div className='text-semi-text-2'>
          {t('annotation.loading', 'Loading annotations...')}
        </div>
      </div>
    );
  }

  // const handleSave = async () => {
  //   const currentImage = getCurrentImage();
  //   await saveAnnotations({ images: [currentImage] });
  // };

  return (
    <CardPro
      type='type1'
      // descriptionArea={
      //   <AnnotationDescription
      //     currentImageIndex={currentImageIndex}
      //     totalImages={totalImages}
      //     t={t}
      //   />
      // }
      // actionsArea={
      //   <AnnotationActions
      //     currentImageIndex={currentImageIndex}
      //     totalImages={totalImages}
      //     onSave={handleSave}
      //     onPrev={handlePrevImage}
      //     onNext={handleNextImage}
      //     onExit={handleExit}
      //     t={t}
      //   />
      // }
      t={t}
    >
      <AnnotationCanvas
        image={getCurrentImage()}
        theme={resolvedTheme}
        language={getAnnotatorLanguage()}
        onExit={handleExit}
        onNextImage={handleNextImage}
        onPrevImage={handlePrevImage}
        t={t}
      />
    </CardPro>
  );
};

export default AnnotationWorkspace;
