import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toast } from '@douyinfe/semi-ui';
import { useTheme } from '@/contexts/ThemeContext';

export const useAnnotationData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();

  // State
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(1);

  // Map i18next language to react-image-annotate language (en, zh, vi)
  const getAnnotatorLanguage = useCallback(() => {
    const lang = i18n.language.split('-')[0]; // Handle en-US -> en
    return ['en', 'zh', 'vi'].includes(lang) ? lang : 'en';
  }, [i18n.language]);

  // Load existing annotations from backend
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/annotations/${id}`);
        // const data = await response.json();
        // setAnnotations(data.regions || []);
        // setTotalImages(data.totalImages || 1);

        // Mock data for now
        setAnnotations([]);
        setTotalImages(1);
      } catch (error) {
        console.error('Failed to load annotations:', error);
        Toast.error(t('annotation.loadFailed', 'Failed to load annotations'));
      } finally {
        setLoading(false);
      }
    };

    loadAnnotations();
  }, [id, t]);

  // Save annotations to backend
  const saveAnnotations = useCallback(async (output) => {
    try {
      console.log('Saving annotations:', output);
      // TODO: Replace with actual API call
      // const imageId = id;
      // await fetch(`/api/annotations/${imageId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(output)
      // });

      Toast.success(t('annotation.saveSuccess', 'Annotations saved successfully'));
      return true;
    } catch (error) {
      console.error('Save error:', error);
      Toast.error(t('annotation.saveFailed', 'Failed to save annotations'));
      return false;
    }
  }, [t]);

  // Handlers
  const handleExit = useCallback(async (output) => {
    console.log('Annotation output:', output);
    console.log(`Saved - Theme: ${resolvedTheme}, Language: ${getAnnotatorLanguage()}`);

    const saved = await saveAnnotations(output);
    if (saved) {
      navigate('/console/projects');
    }
  }, [resolvedTheme, getAnnotatorLanguage, saveAnnotations, navigate]);

  const handleNextImage = useCallback(async (output) => {
    console.log('Next image:', output);
    await saveAnnotations(output);

    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      Toast.info(t('annotation.nextImage', 'Moving to next image'));
      // TODO: Load next image annotations
    } else {
      Toast.warning(t('annotation.lastImage', 'This is the last image'));
    }
  }, [currentImageIndex, totalImages, saveAnnotations, t]);

  const handlePrevImage = useCallback(async (output) => {
    console.log('Previous image:', output);
    await saveAnnotations(output);

    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      Toast.info(t('annotation.prevImage', 'Moving to previous image'));
      // TODO: Load previous image annotations
    } else {
      Toast.warning(t('annotation.firstImage', 'This is the first image'));
    }
  }, [currentImageIndex, saveAnnotations, t]);

  // Get current image data
  const getCurrentImage = useCallback(() => {
    const imagePath = `/samples/image_${String(id).padStart(3, '0')}.jpg`;
    return {
      src: imagePath,
      name: `Image ${id}`,
      regions: annotations,
      pixelSize: { w: 1920, h: 1080 },
    };
  }, [id, annotations]);

  return {
    // State
    id,
    loading,
    annotations,
    currentImageIndex,
    totalImages,
    resolvedTheme,

    // Handlers
    handleExit,
    handleNextImage,
    handlePrevImage,
    saveAnnotations,

    // Data
    getCurrentImage,
    getAnnotatorLanguage,

    // i18n
    t,
  };
};
