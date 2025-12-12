import React, { useEffect, useRef } from 'react';
import ReactImageAnnotate, { I18nProvider } from '@karlorz/react-image-annotate';
import PropTypes from 'prop-types';

const AnnotationCanvas = ({
  image,
  theme,
  language,
  onExit,
  onSave,
  onNextImage,
  onPrevImage,
  onExport,
  onImageLoad,
  t,
}) => {
  const imageLoadedRef = useRef(false);

  // Load image metadata when image src changes
  useEffect(() => {
    if (!image?.src || imageLoadedRef.current) return;

    const img = new Image();
    img.onload = () => {
      imageLoadedRef.current = true;
      if (onImageLoad) {
        const imageName = image.src.split('/').pop();
        const imageId = image.src.match(/image_(\d+)/)?.[1] || '001';
        onImageLoad({
          id: imageId,
          name: imageName,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }
    };
    img.onerror = (err) => {
      console.error('Failed to load image for metadata:', err);
    };
    img.src = image.src;

    return () => {
      imageLoadedRef.current = false;
    };
  }, [image?.src, onImageLoad]);

  const taskDescription = `# ${t('annotation.taskTitle', 'Image Annotation Task')}

## ${t('annotation.instructions', 'Instructions')}

1. ${t('annotation.instruction1', 'Select an annotation tool from the left toolbar')}
2. ${t('annotation.instruction2', 'Draw regions on the image to mark objects')}
3. ${t('annotation.instruction3', 'Assign labels and tags to each region')}
4. ${t('annotation.instruction4', 'Use keyboard shortcuts for faster annotation')}:
   - **Select**: S
   - **Box**: B
   - **Polygon**: P
   - **Point**: O

## ${t('annotation.tips', 'Tips')}

- ${t('annotation.tip1', 'Double-click on a polygon to complete it')}
- ${t('annotation.tip2', 'Right-click to delete a point while drawing')}
- ${t('annotation.tip3', 'Use tags to mark special attributes (occluded, truncated, etc.)')}`;

  const regionClsList = [
    t('annotation.class.defect1', 'Defect1'),
    t('annotation.class.defect2', 'Defect2'),
    t('annotation.class.defect3', 'Defect3'),
  ];

  const regionTagList = [
    t('annotation.tag.occluded', 'occluded'),
    t('annotation.tag.truncated', 'truncated'),
    t('annotation.tag.difficult', 'difficult'),
  ];

  const enabledTools = [
    'select',
    'create-box',
    'create-polygon',
    'create-point',
    'create-line',
    'create-expanding-line',
  ];

  return (
    <I18nProvider language={language}>
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 80px)', // Full viewport minus header
          minHeight: '500px',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          transition: 'background-color 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <ReactImageAnnotate
          key={`${theme}-${image?.src}`}
          taskDescription={taskDescription}
          labelImages={true}
          regionClsList={regionClsList}
          regionTagList={regionTagList}
          enabledTools={enabledTools}
          selectedTool="select"
          allowComments={true}
          hideClone={false}
          hideSettings={false}
          hideFullScreen={false}
          hidePrev={false}
          hideNext={false}
          hideSave={false}
          hideExport={false}
          images={[image]}
          onExit={onExit}
          onSave={onSave}
          onNextImage={onNextImage}
          onPrevImage={onPrevImage}
          onExport={onExport}
          theme={theme}
        />
      </div>
    </I18nProvider>
  );
};

AnnotationCanvas.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    regions: PropTypes.array,
    pixelSize: PropTypes.shape({
      w: PropTypes.number,
      h: PropTypes.number,
    }),
  }).isRequired,
  theme: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  onExit: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onNextImage: PropTypes.func.isRequired,
  onPrevImage: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  onImageLoad: PropTypes.func,
  t: PropTypes.func.isRequired,
};

AnnotationCanvas.defaultProps = {
  onSave: null,
  onExport: null,
  onImageLoad: null,
};

export default AnnotationCanvas;
