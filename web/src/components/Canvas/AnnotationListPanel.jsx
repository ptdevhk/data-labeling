import { Tooltip } from '@douyinfe/semi-ui';
import { Trash2, Crosshair, Ruler, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnnotations } from '@/contexts/AnnotationContext';

const formatCoordinate = (value) => Math.round(value);
const formatFloat = (value, digits = 2) => Number.parseFloat(value).toFixed(digits);

const AnnotationListPanel = () => {
  const { t } = useTranslation();
  const {
    annotations,
    labels,
    activeAnnotationId,
    selectAnnotation,
    removeAnnotation,
  } = useAnnotations();

  const resolveLabel = (labelId) => labels.find((label) => label.id === labelId);
  const selectedAnnotation = annotations.find((annotation) => annotation.id === activeAnnotationId) ?? null;
  const selectedLabel = selectedAnnotation ? resolveLabel(selectedAnnotation.labelId) : null;

  const selectedMetrics = selectedAnnotation
    ? {
        width: formatCoordinate(selectedAnnotation.coordinates.width),
        height: formatCoordinate(selectedAnnotation.coordinates.height),
        area: formatCoordinate(
          selectedAnnotation.coordinates.width * selectedAnnotation.coordinates.height,
        ),
        aspect:
          selectedAnnotation.coordinates.height > 0
            ? formatFloat(
                selectedAnnotation.coordinates.width /
                  selectedAnnotation.coordinates.height,
                2,
              )
            : '—',
        position: `${formatCoordinate(selectedAnnotation.coordinates.x)}, ${formatCoordinate(selectedAnnotation.coordinates.y)}`,
      }
    : null;

  return (
    <>
      <style>{`
        .annotation-list-panel {
          --panel-bg: #FFFFFF;
          --panel-border: #E5E7EB;
        }
        .dark .annotation-list-panel {
          --panel-bg: #1F2937;
          --panel-border: #374151;
        }
      `}</style>
      <div
        className="annotation-list-panel flex flex-col h-full"
        style={{
          background: 'var(--panel-bg)',
          borderLeft: '1px solid var(--panel-border)',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        }}
      >
      <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
        <h2 className="h2" style={{ margin: 0 }}>{t('annotation.inspector.title', 'Annotation Inspector')}</h2>
        <p className="text-sm text-gray-500" style={{ margin: 0 }}>
          {selectedAnnotation
            ? t('annotation.inspector.subtitle.selected', 'Details for the selected rectangle')
            : t('annotation.inspector.subtitle.empty', 'Select a rectangle to inspect its details.')}
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--panel-border)',
          borderRadius: '0.5rem',
          padding: '0.875rem',
          marginBottom: '1rem',
          background: selectedAnnotation ? 'rgba(59, 130, 246, 0.06)' : 'var(--panel-bg)',
        }}
      >
        {selectedAnnotation ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    borderRadius: '9999px',
                    backgroundColor: selectedLabel?.color ?? '#9CA3AF',
                  }}
                />
                <span className="font-medium text-sm">
                  {selectedLabel?.name ?? t('annotation.labels.unassigned', 'Unassigned')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={t('annotation.list.focus', 'Focus')} position="left">
                  <button
                    type="button"
                    onClick={() => selectAnnotation(selectedAnnotation.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#2563EB',
                      padding: '0.25rem',
                      borderRadius: '0.375rem',
                    }}
                    aria-label={t('annotation.list.focus', 'Focus')}
                  >
                    <Crosshair size={16} />
                  </button>
                </Tooltip>
                <Tooltip content={t('common.delete', 'Delete')} position="left">
                  <button
                    type="button"
                    onClick={() => removeAnnotation(selectedAnnotation.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#DC2626',
                      padding: '0.25rem',
                      borderRadius: '0.375rem',
                    }}
                    aria-label={t('common.delete', 'Delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Ruler size={14} />
                <span>{t('annotation.inspector.size', 'Size')}</span>
              </div>
              <span>{`${selectedMetrics.width} × ${selectedMetrics.height}`}</span>
              <div className="flex items-center gap-2">
                <Maximize2 size={14} />
                <span>{t('annotation.inspector.area', 'Area')}</span>
              </div>
              <span>{selectedMetrics.area}</span>
              <div className="text-gray-500">{t('annotation.inspector.aspect', 'Aspect')}</div>
              <span>{selectedMetrics.aspect}</span>
              <div className="text-gray-500">{t('annotation.inspector.position', 'Position')}</div>
              <span>{selectedMetrics.position}</span>
            </div>
          </div>
        ) : (
          <div
            className="text-sm text-gray-500"
            style={{ lineHeight: 1.6 }}
          >
            {t(
              'annotation.inspector.emptyState',
              'After drawing, click a rectangle or choose it in the list below to review its measurements.',
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
        <h3 className="font-semibold" style={{ margin: 0 }}>{t('annotation.list.title', 'Annotations')}</h3>
        <span className="text-xs text-gray-500">
          {t('annotation.list.total', {
            count: annotations.length,
            defaultValue: `Total: ${annotations.length}`,
          })}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-auto" style={{ flex: 1 }}>
        {annotations.length === 0 && (
          <div
            className="text-sm text-gray-500"
            style={{
              padding: '0.75rem',
              border: '1px dashed var(--panel-border, #E5E7EB)',
              borderRadius: '0.5rem',
            }}
          >
            {t('annotation.list.empty', 'Draw rectangles on the canvas to create annotations.')}
          </div>
        )}

        {annotations.map((annotation) => {
          const label = resolveLabel(annotation.labelId);
          const isActive = annotation.id === activeAnnotationId;
          return (
            <div
              key={annotation.id}
              className={`flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isActive ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--panel-border, #E5E7EB)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'var(--panel-bg, #FFFFFF)',
              }}
              onClick={() => selectAnnotation(annotation.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                  <div
                    style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: label?.color ?? '#9CA3AF',
                    }}
                  />
                  <span className="font-medium text-sm">
                    {label?.name ?? t('annotation.labels.unassigned', 'Unassigned')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {`x:${formatCoordinate(annotation.coordinates.x)} y:${formatCoordinate(annotation.coordinates.y)} · w:${formatCoordinate(annotation.coordinates.width)} · h:${formatCoordinate(annotation.coordinates.height)}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={t('annotation.list.focus', 'Focus')} position="left">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      selectAnnotation(annotation.id);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#2563EB',
                      padding: '0.25rem',
                      borderRadius: '0.375rem',
                    }}
                    aria-label={t('annotation.list.focus', 'Focus')}
                  >
                    <Crosshair size={16} />
                  </button>
                </Tooltip>
                <Tooltip content={t('common.delete', 'Delete')} position="left">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeAnnotation(annotation.id);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#DC2626',
                      padding: '0.25rem',
                      borderRadius: '0.375rem',
                    }}
                    aria-label={t('common.delete', 'Delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
};

export default AnnotationListPanel;
