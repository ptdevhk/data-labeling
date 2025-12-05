import { useState } from 'react';
import { Modal, Select, Button, Space, Typography, Divider } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import {
  exportToYOLO,
  exportToCOCO,
  exportToPascalVOC,
  exportToJSON,
  downloadFiles,
} from '@/utils/exportFormats';

const { Text } = Typography;

const ExportDialog = ({ visible, onCancel, annotations, labels, imageMetadata }) => {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState('json');
  const [exporting, setExporting] = useState(false);

  const formats = [
    { value: 'json', label: 'JSON', description: 'Standard annotation format (.json)' },
    { value: 'yolo', label: 'YOLO', description: 'Normalized bounding boxes (.txt)' },
    { value: 'coco', label: 'COCO', description: 'MS COCO JSON format' },
    { value: 'voc', label: 'Pascal VOC', description: 'XML format with bounding boxes' },
  ];

  const handleExport = async () => {
    if (!imageMetadata) {
      console.error('Image metadata missing');
      return;
    }

    setExporting(true);
    try {
      const { width, height, id, name } = imageMetadata;
      let files = [];

      switch (exportFormat) {
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
      onCancel();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      title={t('export.dialog.title', 'Export Annotations')}
      visible={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.cancel', 'Cancel')}</Button>
          <Button
            theme="solid"
            type="primary"
            onClick={handleExport}
            loading={exporting}
            disabled={annotations.length === 0}
          >
            {t('export.dialog.export', 'Export')}
          </Button>
        </Space>
      }
      style={{ width: 500 }}
    >
      <Space vertical style={{ width: '100%' }} spacing="loose">
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('export.dialog.format', 'Export Format')}
          </Text>
          <Select
            value={exportFormat}
            onChange={setExportFormat}
            style={{ width: '100%' }}
            optionList={formats}
            renderSelectedItem={(option) => option.label}
            renderOptionItem={(option) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: 500 }}>{option.label}</div>
                <Text size="small" type="tertiary">
                  {option.description}
                </Text>
              </div>
            )}
          />
        </div>

        <Divider margin="12px" />

        <div>
          <Text type="tertiary" size="small">
            {t('export.dialog.stats', {
              defaultValue: 'Total Annotations: {{count}}',
              count: annotations.length,
            })}
          </Text>
          <br />
          <Text type="tertiary" size="small">
            {t('export.dialog.labels', {
              defaultValue: 'Total Labels: {{count}}',
              count: labels.length,
            })}
          </Text>
        </div>

        {annotations.length === 0 && (
          <Text type="warning" size="small">
            {t('export.dialog.noAnnotations', 'No annotations to export')}
          </Text>
        )}
      </Space>
    </Modal>
  );
};

export default ExportDialog;
