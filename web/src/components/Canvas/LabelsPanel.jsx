import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Tag } from 'lucide-react';
import { useAnnotations } from '@/contexts/AnnotationContext';

const LabelsPanel = () => {
  const { t } = useTranslation();
  const {
    annotations,
    labels,
    addLabel,
    activeLabelId,
    setActiveLabelId,
  } = useAnnotations();

  const totalAnnotations = annotations.length;
  const labelCounts = useMemo(() => {
    return labels.map((label) => ({
      ...label,
      count: annotations.filter((annotation) => annotation.labelId === label.id).length,
    }));
  }, [annotations, labels]);

  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      const newLabel = addLabel({ name: newLabelName, color: newLabelColor });
      setActiveLabelId(newLabel.id);
      setNewLabelName('');
      setShowAddLabel(false);
    }
  };

  return (
    <>
      <style>{`
        .labels-panel {
          --panel-bg: #FFFFFF;
          --panel-border: #E5E7EB;
          --input-bg: #FFFFFF;
          --input-border: #E5E7EB;
          --button-bg: #F3F4F6;
        }
        .dark .labels-panel {
          --panel-bg: #1F2937;
          --panel-border: #374151;
          --input-bg: #374151;
          --input-border: #4B5563;
          --button-bg: #374151;
        }
      `}</style>
      <div 
        className="labels-panel h-full flex flex-col"
        style={{
          padding: '1rem',
          background: 'var(--panel-bg)',
          borderLeft: '1px solid var(--panel-border)',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <h2 className="h2">{t('annotation.labels.title')}</h2>
        <button
          onClick={() => setShowAddLabel(!showAddLabel)}
          className="hover:bg-neutral dark:hover:bg-neutral-dark transition-colors"
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={t('annotation.labels.addClass')}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add Label Form */}
      {showAddLabel && (
        <div 
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background: 'var(--button-bg)'
          }}
        >
          <input
            type="text"
            placeholder={t('annotation.labels.className')}
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--input-border)',
              background: 'var(--input-bg)',
              width: '100%',
              color: 'inherit'
            }}
          />
          <div className="flex items-center" style={{ gap: '0.5rem' }}>
            <label className="text-sm">{t('annotation.labels.color')}:</label>
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              style={{
                width: '3rem',
                height: '2rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                border: '1px solid #E5E7EB'
              }}
            />
          </div>
          <div className="flex" style={{ gap: '0.5rem' }}>
            <button
              onClick={handleAddLabel}
              className="flex-1 bg-primary text-white hover:bg-blue-600 transition-colors"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {t('common.create')}
            </button>
            <button
              onClick={() => setShowAddLabel(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                background: '#D1D5DB',
                border: 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Labels List */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('annotation.labels.totalAnnotations', { count: totalAnnotations })}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {labelCounts.map((label) => (
          <div
            key={label.id}
            className="hover:border-primary transition-colors cursor-pointer"
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: label.id === activeLabelId ? '2px solid #3B82F6' : '2px solid transparent',
              backgroundColor: `${label.color}20`,
              transition: 'border-color 0.15s ease'
            }}
            onClick={() => setActiveLabelId(label.id)}
          >
            <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '9999px',
                  backgroundColor: label.color
                }}
              ></div>
              <span className="font-medium">{label.name}</span>
              {label.id === activeLabelId && (
                <span
                  className="text-xs"
                  style={{
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    fontWeight: 500,
                  }}
                >
                  {t('common.active', 'Active')}
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400" style={{ gap: '0.5rem' }}>
              <Tag size={14} />
              <span>{label.count} annotations</span>
            </div>
          </div>
        ))}
      </div>

      {/* Attributes Section */}
      <div 
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--panel-border)'
        }}
      >
        <h3 className="font-semibold" style={{ marginBottom: '0.5rem' }}>{t('annotation.labels.attributes')}</h3>
        <p className="caption text-gray-500">Select a shape to edit attributes</p>
      </div>
    </div>
    </>
  );
};

export default LabelsPanel;
