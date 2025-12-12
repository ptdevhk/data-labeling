import { useState } from 'react';
import { Modal, Button, Input } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Plus, Tag } from 'lucide-react';
import { useAnnotations } from '@/contexts/AnnotationContext';

const LabelAssignmentDialog = ({ visible, onAssign, onSkip }) => {
  const { t } = useTranslation();
  const {
    labels,
    addLabel,
    activeLabelId,
    setActiveLabelId,
  } = useAnnotations();
  const initialSelectedLabel = activeLabelId ?? labels[0]?.id ?? null;
  const [selectedLabel, setSelectedLabel] = useState(initialSelectedLabel);
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labels[0]?.color ?? '#3B82F6');

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      const newLabel = addLabel({ name: newLabelName, color: newLabelColor });
      setSelectedLabel(newLabel.id);
      setNewLabelName('');
      setShowNewLabel(false);
    }
  };

  const handleAssign = () => {
    if (selectedLabel) {
      setActiveLabelId(selectedLabel);
      onAssign(selectedLabel);
    }
  };

  return (
    <Modal
      title={t('annotation.labels.assignLabel')}
      visible={visible}
      onCancel={onSkip}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onSkip}>{t('common.skip')}</Button>
          <Button
            theme="solid"
            type="primary"
            disabled={!selectedLabel}
            onClick={handleAssign}
          >
            {t('common.assign')}
          </Button>
        </div>
      }
      width={480}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('annotation.labels.selectOrCreateLabel')}
        </p>

        {/* Label Selection Grid */}
        <div className="grid grid-cols-2 gap-2">
          {labels.map((label) => (
            <div
              key={label.id}
              onClick={() => setSelectedLabel(label.id)}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                selectedLabel === label.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="font-medium text-sm">{label.name}</span>
              </div>
            </div>
          ))}

          {/* Create New Label Button */}
          {!showNewLabel && (
            <div
              onClick={() => setShowNewLabel(true)}
              className="cursor-pointer p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" />
              <span className="text-sm">{t('annotation.labels.createNew')}</span>
            </div>
          )}
        </div>

        {/* New Label Form */}
        {showNewLabel && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
            <Input
              placeholder={t('annotation.labels.labelName')}
              value={newLabelName}
              onChange={setNewLabelName}
              prefix={<Tag size={16} />}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('annotation.labels.color')}:</span>
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-12 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              <Button
                theme="solid"
                type="primary"
                onClick={handleCreateLabel}
                className="flex-1"
              >
                {t('common.create')}
              </Button>
              <Button
                onClick={() => {
                  setShowNewLabel(false);
                  setNewLabelName('');
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LabelAssignmentDialog;
