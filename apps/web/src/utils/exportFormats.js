import packageJson from '../../package.json';

/**
 * Export annotation formats - inspired by AnyLabeling
 * Supports YOLO, COCO, Pascal VOC, and JSON formats
 */

/**
 * Export annotations to YOLO format
 * Format: <class_id> <x_center> <y_center> <width> <height> (normalized)
 */
export const exportToYOLO = (annotations, labels, imageWidth, imageHeight, imageId) => {
  const files = [];
  const labelMap = {};
  labels.forEach((label, index) => {
    labelMap[label.id] = index;
  });

  // Generate classes.txt
  const classesContent = labels.map((l) => l.name).join('\n');
  files.push({
    name: 'classes.txt',
    content: classesContent,
    type: 'text/plain',
  });

  // Generate annotation file
  const lines = [];
  annotations.forEach((ann) => {
    if (!ann.labelId || !(ann.labelId in labelMap)) return;

    const classId = labelMap[ann.labelId];
    const coords = ann.coordinates;

    if (ann.type === 'rectangle') {
      const x = coords.left;
      const y = coords.top;
      const w = coords.width;
      const h = coords.height;

      const xCenter = (x + w / 2) / imageWidth;
      const yCenter = (y + h / 2) / imageHeight;
      const normWidth = w / imageWidth;
      const normHeight = h / imageHeight;

      lines.push(`${classId} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${normWidth.toFixed(6)} ${normHeight.toFixed(6)}`);
    } else if (ann.type === 'polygon' && coords.points?.length >= 3) {
      // YOLO segmentation format: <class_id> <x1> <y1> <x2> <y2> ...
      const normalizedPoints = coords.points
        .map((pt) => `${(pt.x / imageWidth).toFixed(6)} ${(pt.y / imageHeight).toFixed(6)}`)
        .join(' ');
      lines.push(`${classId} ${normalizedPoints}`);
    }
  });

  files.push({
    name: `image_${imageId}.txt`,
    content: lines.join('\n'),
    type: 'text/plain',
  });

  return files;
};

/**
 * Export annotations to COCO JSON format
 */
export const exportToCOCO = (annotations, labels, imageWidth, imageHeight, imageId, imageName) => {
  const labelMap = {};
  const categories = labels.map((label, index) => {
    labelMap[label.id] = index + 1;
    return {
      id: index + 1,
      name: label.name,
      supercategory: 'object',
    };
  });

  const cocoAnnotations = [];
  let annotationId = 1;

  annotations.forEach((ann) => {
    if (!ann.labelId || !(ann.labelId in labelMap)) return;

    const categoryId = labelMap[ann.labelId];
    const coords = ann.coordinates;

    if (ann.type === 'rectangle') {
      const bbox = [coords.left, coords.top, coords.width, coords.height];
      const area = coords.width * coords.height;

      cocoAnnotations.push({
        id: annotationId++,
        image_id: imageId,
        category_id: categoryId,
        bbox,
        area,
        segmentation: [],
        iscrowd: 0,
      });
    } else if (ann.type === 'polygon' && coords.points?.length >= 3) {
      const segmentation = [coords.points.flatMap((pt) => [pt.x, pt.y])];
      
      // Calculate bounding box
      const xs = coords.points.map((pt) => pt.x);
      const ys = coords.points.map((pt) => pt.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const bbox = [minX, minY, maxX - minX, maxY - minY];
      const area = (maxX - minX) * (maxY - minY);

      cocoAnnotations.push({
        id: annotationId++,
        image_id: imageId,
        category_id: categoryId,
        bbox,
        area,
        segmentation,
        iscrowd: 0,
      });
    } else if (ann.type === 'circle') {
      // Approximate circle as polygon
      const numPoints = 32;
      const segmentation = [[]];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const x = coords.centerX + coords.radius * Math.cos(angle);
        const y = coords.centerY + coords.radius * Math.sin(angle);
        segmentation[0].push(x, y);
      }

      const bbox = [
        coords.centerX - coords.radius,
        coords.centerY - coords.radius,
        coords.radius * 2,
        coords.radius * 2,
      ];
      const area = Math.PI * coords.radius * coords.radius;

      cocoAnnotations.push({
        id: annotationId++,
        image_id: imageId,
        category_id: categoryId,
        bbox,
        area,
        segmentation,
        iscrowd: 0,
      });
    }
  });

  const cocoData = {
    info: {
      description: 'Data Labeling Tool Export',
      version: '1.0',
      year: new Date().getFullYear(),
      date_created: new Date().toISOString(),
    },
    licenses: [],
    images: [
      {
        id: imageId,
        file_name: imageName,
        width: imageWidth,
        height: imageHeight,
      },
    ],
    annotations: cocoAnnotations,
    categories,
  };

  return [
    {
      name: 'annotations.json',
      content: JSON.stringify(cocoData, null, 2),
      type: 'application/json',
    },
  ];
};

/**
 * Export annotations to Pascal VOC XML format
 */
export const exportToPascalVOC = (annotations, labels, imageWidth, imageHeight, imageId, imageName) => {
  const labelMap = {};
  labels.forEach((label) => {
    labelMap[label.id] = label.name;
  });

  const objects = [];
  annotations.forEach((ann) => {
    if (!ann.labelId || !(ann.labelId in labelMap)) return;

    const labelName = labelMap[ann.labelId];
    const coords = ann.coordinates;

    if (ann.type === 'rectangle') {
      objects.push(`
    <object>
      <name>${labelName}</name>
      <pose>Unspecified</pose>
      <truncated>0</truncated>
      <difficult>0</difficult>
      <bndbox>
        <xmin>${Math.round(coords.left)}</xmin>
        <ymin>${Math.round(coords.top)}</ymin>
        <xmax>${Math.round(coords.left + coords.width)}</xmax>
        <ymax>${Math.round(coords.top + coords.height)}</ymax>
      </bndbox>
    </object>`);
    } else if (ann.type === 'polygon' && coords.points?.length >= 3) {
      const xs = coords.points.map((pt) => pt.x);
      const ys = coords.points.map((pt) => pt.y);
      const xmin = Math.min(...xs);
      const ymin = Math.min(...ys);
      const xmax = Math.max(...xs);
      const ymax = Math.max(...ys);

      objects.push(`
    <object>
      <name>${labelName}</name>
      <pose>Unspecified</pose>
      <truncated>0</truncated>
      <difficult>0</difficult>
      <bndbox>
        <xmin>${Math.round(xmin)}</xmin>
        <ymin>${Math.round(ymin)}</ymin>
        <xmax>${Math.round(xmax)}</xmax>
        <ymax>${Math.round(ymax)}</ymax>
      </bndbox>
      <polygon>
        ${coords.points.map((pt) => `<point><x>${Math.round(pt.x)}</x><y>${Math.round(pt.y)}</y></point>`).join('\n        ')}
      </polygon>
    </object>`);
    }
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <folder>images</folder>
  <filename>${imageName}</filename>
  <path>${imageName}</path>
  <source>
    <database>Data Labeling Tool</database>
  </source>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>${objects.join('')}
</annotation>`;

  return [
    {
      name: `image_${imageId}.xml`,
      content: xml,
      type: 'application/xml',
    },
  ];
};

/**
 * Export annotations to JSON format
 * Uses the same format as auto-save for consistency
 */
export const exportToJSON = (annotations, labels, imageWidth, imageHeight, imageId, imageName) => {
  // Helper to convert our annotations to AnyLabeling format
  const toAnyLabelingShape = (annotation) => {
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

  // Convert to AnyLabeling format
  const shapes = annotations.map(ann => toAnyLabelingShape(ann));
  
  const data = {
    version: packageJson.version,
    flags: {},
    shapes,
    imagePath: imageName,
    imageData: null,
    imageHeight: imageHeight,
    imageWidth: imageWidth,
  };

  return [
    {
      name: `${imageName.replace(/\.[^/.]+$/, '')}.json`,
      content: JSON.stringify(data, null, 2),
      type: 'application/json',
    },
  ];
};

/**
 * Trigger browser download for files
 */
export const downloadFiles = (files) => {
  files.forEach((file) => {
    const blob = new Blob([file.content], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};
