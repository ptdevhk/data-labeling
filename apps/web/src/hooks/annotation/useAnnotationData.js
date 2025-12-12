import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toast } from '@douyinfe/semi-ui';
import { useTheme } from '@/contexts/ThemeContext';
import {
  exportToYOLO,
  exportToCOCO,
  exportToPascalVOC,
  exportToJSON,
  downloadFiles,
} from '@/utils/exportFormats';

/**
 * Convert react-image-annotate regions to AnyLabeling format for storage/export
 * @param {Array} regions - Regions from react-image-annotate
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @returns {Array} Shapes in AnyLabeling format
 */
const convertRegionsToShapes = (regions, imageWidth, imageHeight) => {
  if (!regions || !Array.isArray(regions)) return [];

  return regions.map((region) => {
    const shape = {
      label: region.cls || '',
      text: region.comment || '',
      points: [],
      group_id: null,
      shape_type: '',
      flags: region.tags ? region.tags.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}) : {},
      color: region.color || null, // Preserve color for reload
    };

    // Convert normalized coordinates (0-1) to absolute pixels
    switch (region.type) {
      case 'box': {
        shape.shape_type = 'rectangle';
        const x1 = region.x * imageWidth;
        const y1 = region.y * imageHeight;
        const x2 = (region.x + region.w) * imageWidth;
        const y2 = (region.y + region.h) * imageHeight;
        shape.points = [[x1, y1], [x2, y2]];
        break;
      }
      case 'polygon': {
        shape.shape_type = 'polygon';
        shape.points = (region.points || []).map((pt) => [
          pt[0] * imageWidth,
          pt[1] * imageHeight,
        ]);
        break;
      }
      case 'point': {
        shape.shape_type = 'point';
        shape.points = [[region.x * imageWidth, region.y * imageHeight]];
        break;
      }
      case 'line': {
        shape.shape_type = 'line';
        shape.points = [
          [region.x1 * imageWidth, region.y1 * imageHeight],
          [region.x2 * imageWidth, region.y2 * imageHeight],
        ];
        break;
      }
      default:
        shape.shape_type = region.type;
    }

    return shape;
  });
};

// Default colors for regions (matches react-image-annotate defaults)
const REGION_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
];

/**
 * Convert AnyLabeling shapes back to react-image-annotate regions
 * @param {Array} shapes - Shapes in AnyLabeling format
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @returns {Array} Regions for react-image-annotate
 */
const convertShapesToRegions = (shapes, imageWidth, imageHeight) => {
  if (!shapes || !Array.isArray(shapes)) return [];

  return shapes.map((shape, index) => {
    const region = {
      id: `region-${index}-${Date.now()}`,
      cls: shape.label || '',
      comment: shape.text || '',
      tags: Object.keys(shape.flags || {}).filter((key) => shape.flags[key]),
      color: shape.color || REGION_COLORS[index % REGION_COLORS.length], // Required by react-image-annotate
    };

    // Convert absolute pixels to normalized coordinates (0-1)
    switch (shape.shape_type) {
      case 'rectangle': {
        region.type = 'box';
        if (shape.points && shape.points.length === 2) {
          const [[x1, y1], [x2, y2]] = shape.points;
          region.x = Math.min(x1, x2) / imageWidth;
          region.y = Math.min(y1, y2) / imageHeight;
          region.w = Math.abs(x2 - x1) / imageWidth;
          region.h = Math.abs(y2 - y1) / imageHeight;
        }
        break;
      }
      case 'polygon': {
        region.type = 'polygon';
        region.points = (shape.points || []).map((pt) => [
          pt[0] / imageWidth,
          pt[1] / imageHeight,
        ]);
        break;
      }
      case 'point': {
        region.type = 'point';
        if (shape.points && shape.points.length > 0) {
          region.x = shape.points[0][0] / imageWidth;
          region.y = shape.points[0][1] / imageHeight;
        }
        break;
      }
      case 'line': {
        region.type = 'line';
        if (shape.points && shape.points.length === 2) {
          region.x1 = shape.points[0][0] / imageWidth;
          region.y1 = shape.points[0][1] / imageHeight;
          region.x2 = shape.points[1][0] / imageWidth;
          region.y2 = shape.points[1][1] / imageHeight;
        }
        break;
      }
      default:
        region.type = shape.shape_type;
    }

    return region;
  });
};

/**
 * Convert regions to internal annotation format for export utilities
 */
const convertRegionsToAnnotations = (regions, imageWidth, imageHeight, labels) => {
  if (!regions || !Array.isArray(regions)) return [];

  return regions.map((region, index) => {
    const label = labels.find((l) => l.name === region.cls);
    const annotation = {
      id: region.id || `ann-${index}`,
      type: region.type === 'box' ? 'rectangle' : region.type,
      labelId: label?.id || null,
      coordinates: {},
      meta: {
        tags: region.tags || [],
        comment: region.comment || '',
      },
    };

    // Convert normalized to absolute coordinates
    switch (region.type) {
      case 'box':
        annotation.coordinates = {
          left: region.x * imageWidth,
          top: region.y * imageHeight,
          width: region.w * imageWidth,
          height: region.h * imageHeight,
        };
        break;
      case 'polygon':
        annotation.coordinates = {
          points: (region.points || []).map((pt) => ({
            x: pt[0] * imageWidth,
            y: pt[1] * imageHeight,
          })),
        };
        break;
      case 'point':
        annotation.coordinates = {
          x: region.x * imageWidth,
          y: region.y * imageHeight,
        };
        break;
      case 'line':
        annotation.coordinates = {
          x1: region.x1 * imageWidth,
          y1: region.y1 * imageHeight,
          x2: region.x2 * imageWidth,
          y2: region.y2 * imageHeight,
        };
        break;
      default:
        break;
    }

    return annotation;
  });
};

export const useAnnotationData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();

  // State
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [exportState, setExportState] = useState(null); // Store library state for export

  // Labels configuration
  const [labels] = useState([
    { id: 'label-1', name: 'Defect1', color: '#3B82F6' },
    { id: 'label-2', name: 'Defect2', color: '#10B981' },
    { id: 'label-3', name: 'Defect3', color: '#EF4444' },
  ]);

  // Refs for auto-save
  const saveTimeoutRef = useRef(null);
  const regionsRef = useRef(regions);

  // Keep ref updated
  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  // Storage key for localStorage
  const storageKey = `annotation-${id}`;

  // Map i18next language to react-image-annotate language (en, zh, vi)
  const getAnnotatorLanguage = useCallback(() => {
    const lang = i18n.language.split('-')[0];
    return ['en', 'zh', 'vi'].includes(lang) ? lang : 'en';
  }, [i18n.language]);

  // Load existing annotations from localStorage
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        // Try to load from localStorage first
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.shapes && Array.isArray(data.shapes)) {
            // Need image dimensions to convert - use saved or default
            const width = data.imageWidth || 1920;
            const height = data.imageHeight || 1080;
            const loadedRegions = convertShapesToRegions(data.shapes, width, height);
            setRegions(loadedRegions);
            setImageMetadata({
              id: id,
              name: data.imagePath || `image_${id}.jpg`,
              width,
              height,
            });
            setLastSavedAt(new Date(data.savedAt || Date.now()));
          }
        }

        // TODO: Also try to load from backend API
        // const response = await fetch(`/api/annotations/${id}`);
        // const data = await response.json();

        setTotalImages(1); // TODO: Get from dataset API
      } catch (error) {
        console.error('Failed to load annotations:', error);
        Toast.error(t('annotation.loadFailed', 'Failed to load annotations'));
      } finally {
        setLoading(false);
      }
    };

    loadAnnotations();
  }, [id, storageKey, t]);

  // Auto-save with debounce (3 seconds after last change)
  useEffect(() => {
    if (!isDirty || !imageMetadata) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage(regionsRef.current);
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, imageMetadata]);

  // Save to localStorage
  const saveToLocalStorage = useCallback((regionsToSave) => {
    if (!id || !imageMetadata) return false;

    try {
      const currentRegions = regionsToSave || regionsRef.current;
      const shapes = convertRegionsToShapes(
        currentRegions,
        imageMetadata.width,
        imageMetadata.height
      );

      const data = {
        version: '1.0.0',
        flags: {},
        shapes,
        imagePath: imageMetadata.name,
        imageData: null,
        imageHeight: imageMetadata.height,
        imageWidth: imageMetadata.width,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(data, null, 2));
      setIsDirty(false);
      setLastSavedAt(new Date());
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [id, imageMetadata, storageKey]);

  // Manual save handler
  const handleSave = useCallback((output) => {
    // Extract regions from react-image-annotate output
    const outputRegions = output?.images?.[0]?.regions || regionsRef.current;
    setRegions(outputRegions);

    const success = saveToLocalStorage(outputRegions);
    if (success) {
      Toast.success(t('annotation.saveSuccess', 'Annotations saved successfully'));
    } else {
      Toast.error(t('annotation.saveFailed', 'Failed to save annotations'));
    }
    return success;
  }, [saveToLocalStorage, t]);

  // Export handler - uses regions from stored library state
  const handleExport = useCallback((format) => {
    if (!imageMetadata) {
      Toast.warning(t('annotation.export.waitForImage', 'Please wait for image to load'));
      return;
    }

    // Get regions from the stored library state (passed when export dialog opened)
    const currentRegions = exportState?.images?.[0]?.regions || regionsRef.current;
    if (!currentRegions || currentRegions.length === 0) {
      Toast.warning(t('annotation.export.noAnnotations', 'No annotations to export'));
      return;
    }

    try {
      const { width, height, name } = imageMetadata;
      const annotations = convertRegionsToAnnotations(currentRegions, width, height, labels);
      let files = [];

      switch (format) {
        case 'yolo':
          files = exportToYOLO(annotations, labels, width, height, id);
          break;
        case 'coco':
          files = exportToCOCO(annotations, labels, width, height, id, name);
          break;
        case 'voc':
          files = exportToPascalVOC(annotations, labels, width, height, id, name);
          break;
        case 'json':
        default:
          files = exportToJSON(annotations, labels, width, height, id, name);
          break;
      }

      downloadFiles(files);
      Toast.success(t('annotation.export.success', 'Export completed'));
      setExportDialogVisible(false);
      setExportState(null); // Clear state after export
    } catch (error) {
      console.error('Export failed:', error);
      Toast.error(t('annotation.export.failed', 'Export failed'));
    }
  }, [imageMetadata, labels, id, t, exportState]);

  // Handle image metadata from canvas
  const handleImageLoad = useCallback((metadata) => {
    setImageMetadata(metadata);
  }, []);

  // Handle annotation changes from react-image-annotate
  const handleAnnotationChange = useCallback((output) => {
    const newRegions = output?.images?.[0]?.regions || [];
    setRegions(newRegions);
    setIsDirty(true);
  }, []);

  // Exit handler - save and navigate away
  const handleExit = useCallback((output) => {
    const outputRegions = output?.images?.[0]?.regions || [];
    setRegions(outputRegions);

    if (imageMetadata) {
      saveToLocalStorage(outputRegions);
    }

    navigate('/console/projects');
  }, [saveToLocalStorage, navigate, imageMetadata]);

  // Next image handler
  const handleNextImage = useCallback((output) => {
    const outputRegions = output?.images?.[0]?.regions || [];
    setRegions(outputRegions);

    if (imageMetadata) {
      saveToLocalStorage(outputRegions);
    }

    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      Toast.info(t('annotation.nextImage', 'Moving to next image'));
      // TODO: Load next image annotations
    } else {
      Toast.warning(t('annotation.lastImage', 'This is the last image'));
    }
  }, [currentImageIndex, totalImages, saveToLocalStorage, imageMetadata, t]);

  // Previous image handler
  const handlePrevImage = useCallback((output) => {
    const outputRegions = output?.images?.[0]?.regions || [];
    setRegions(outputRegions);

    if (imageMetadata) {
      saveToLocalStorage(outputRegions);
    }

    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      Toast.info(t('annotation.prevImage', 'Moving to previous image'));
      // TODO: Load previous image annotations
    } else {
      Toast.warning(t('annotation.firstImage', 'This is the first image'));
    }
  }, [currentImageIndex, saveToLocalStorage, imageMetadata, t]);

  // Get current image data for react-image-annotate
  const getCurrentImage = useCallback(() => {
    const imagePath = `/samples/image_${String(id).padStart(3, '0')}.jpg`;
    return {
      src: imagePath,
      name: `Image ${id}`,
      regions: regions,
      pixelSize: imageMetadata
        ? { w: imageMetadata.width, h: imageMetadata.height }
        : { w: 1920, h: 1080 },
    };
  }, [id, regions, imageMetadata]);

  // Open export dialog - receives state from library
  const openExportDialog = useCallback((libraryState) => {
    if (!imageMetadata) {
      Toast.warning(t('annotation.export.waitForImage', 'Please wait for image to load'));
      return;
    }
    // Store the library state for export
    setExportState(libraryState);
    setExportDialogVisible(true);
  }, [imageMetadata, t]);

  // Close export dialog
  const closeExportDialog = useCallback(() => {
    setExportDialogVisible(false);
  }, []);

  // Get the annotation count for export dialog (from library state)
  const getExportAnnotationCount = useCallback(() => {
    return exportState?.images?.[0]?.regions?.length || 0;
  }, [exportState]);

  return {
    // State
    id,
    loading,
    regions,
    currentImageIndex,
    totalImages,
    resolvedTheme,
    isDirty,
    lastSavedAt,
    imageMetadata,
    exportDialogVisible,
    labels,

    // Handlers
    handleExit,
    handleNextImage,
    handlePrevImage,
    handleSave,
    handleExport,
    handleImageLoad,
    handleAnnotationChange,
    openExportDialog,
    closeExportDialog,

    // Data
    getCurrentImage,
    getAnnotatorLanguage,
    getExportAnnotationCount,

    // i18n
    t,
  };
};
