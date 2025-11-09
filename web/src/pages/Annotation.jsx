import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactImageAnnotate, { I18nProvider } from '@karlorz/react-image-annotate';
import { Toast } from '@douyinfe/semi-ui';
import { useTheme } from '@/contexts/ThemeContext';

const Annotate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map i18next language to react-image-annotate language (en, zh, vi)
  const getAnnotatorLanguage = () => {
    const lang = i18n.language.split('-')[0]; // Handle en-US -> en
    return ['en', 'zh', 'vi'].includes(lang) ? lang : 'en';
  };

  // Load existing annotations from backend (placeholder for now)
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/annotations/${id}`);
        // const data = await response.json();
        // setAnnotations(data.regions || []);

        // Mock data for now
        setAnnotations([]);
      } catch (error) {
        console.error('Failed to load annotations:', error);
        Toast.error(t('annotation.loadFailed', 'Failed to load annotations'));
      } finally {
        setLoading(false);
      }
    };

    loadAnnotations();
  }, [id, t]);

  // Map project ID to sample images
  const imagePath = `/samples/image_${String(id).padStart(3, '0')}.jpg`;

  const handleExit = async (output) => {
    console.log('Annotation output:', output);
    console.log(`Saved - Theme: ${resolvedTheme}, Language: ${getAnnotatorLanguage()}`);

    try {
      // TODO: Replace with actual API call to save annotations
      Toast.success(t('annotation.saveSuccess', 'Annotations saved successfully'));
      navigate('/console/projects');
    } catch (error) {
      console.error('Save error:', error);
      Toast.error(t('annotation.saveFailed', 'Failed to save annotations'));
    }
  };

  const handleNextImage = (output) => {
    console.log('Next image:', output);
    Toast.info(t('annotation.nextImage', 'Moving to next image'));
    // TODO: Implement navigation to next image in dataset
  };

  const handlePrevImage = (output) => {
    console.log('Previous image:', output);
    Toast.info(t('annotation.prevImage', 'Moving to previous image'));
    // TODO: Implement navigation to previous image in dataset
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-semi-text-2">{t('annotation.loading', 'Loading annotations...')}</div>
      </div>
    );
  }

  return (
    <I18nProvider language={getAnnotatorLanguage()}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
          transition: 'background-color 0.3s ease',
        }}
      >
        <ReactImageAnnotate
          key={resolvedTheme}
          taskDescription={`# ${t('annotation.taskTitle', 'Image Annotation Task')}

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
- ${t('annotation.tip3', 'Use tags to mark special attributes (occluded, truncated, etc.)')}`}
          labelImages={true}
          regionClsList={[
            t('annotation.class.defect1', 'Defect1'),
            t('annotation.class.defect2', 'Defect2'),
            t('annotation.class.defect3', 'Defect3')
          ]}
          enabledTools={[
            'select',
            'create-box',
            'create-polygon',
            'create-point',
            'create-line',
            'create-expanding-line'
          ]}
          selectedTool="select"
          // showTags={true}
          allowComments={true}
          hideClone={false}
          hideSettings={false}
          hideFullScreen={false}
          hidePrev={false}
          hideNext={false}
          images={[
            {
              src: imagePath,
              name: `Image ${id}`,
              regions: annotations,
              pixelSize: { w: 1920, h: 1080 },
            }
          ]}
          onExit={handleExit}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
          theme={resolvedTheme}
        />
      </div>
    </I18nProvider>
  );
};

export default Annotate;
