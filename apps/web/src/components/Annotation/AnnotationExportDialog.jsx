import { useState } from 'react';
import { Modal, Select, Button, Space, Typography, Divider } from '@douyinfe/semi-ui';
import PropTypes from 'prop-types';

const { Text } = Typography;

const AnnotationExportDialog = ({
  visible,
  onCancel,
  onExport,
  annotationCount,
  labelCount,
  t,
}) => {
  const [exportFormat, setExportFormat] = useState('json');

  const formats = [
    {
      value: 'json',
      label: 'JSON',
      description: t('export.format.json.desc', 'AnyLabeling compatible format (.json)'),
    },
    {
      value: 'yolo',
      label: 'YOLO',
      description: t('export.format.yolo.desc', 'Normalized bounding boxes (.txt)'),
    },
    {
      value: 'coco',
      label: 'COCO',
      description: t('export.format.coco.desc', 'MS COCO JSON format'),
    },
    {
      value: 'voc',
      label: 'Pascal VOC',
      description: t('export.format.voc.desc', 'XML format with bounding boxes'),
    },
  ];

  const handleExport = () => {
    onExport(exportFormat);
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
            disabled={annotationCount === 0}
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
              defaultValue: `Total Annotations: ${annotationCount}`,
              count: annotationCount,
            })}
          </Text>
          <br />
          <Text type="tertiary" size="small">
            {t('export.dialog.labels', {
              defaultValue: `Total Labels: ${labelCount}`,
              count: labelCount,
            })}
          </Text>
        </div>

        {annotationCount === 0 && (
          <Text type="warning" size="small">
            {t('export.dialog.noAnnotations', 'No annotations to export')}
          </Text>
        )}
      </Space>
    </Modal>
  );
};

AnnotationExportDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  annotationCount: PropTypes.number,
  labelCount: PropTypes.number,
  t: PropTypes.func.isRequired,
};

AnnotationExportDialog.defaultProps = {
  annotationCount: 0,
  labelCount: 0,
};

export default AnnotationExportDialog;
