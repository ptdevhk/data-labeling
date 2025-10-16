import { useTranslation } from 'react-i18next';
import { MousePointer, Square, Circle, Pentagon, Minus, MapPin, Eraser, Undo, Redo } from 'lucide-react';

const ToolsPalette = ({ activeTool, onToolChange }) => {
  const { t } = useTranslation();

  const tools = [
    { id: 'select', icon: MousePointer, label: t('annotation.tools.select') },
    { id: 'rectangle', icon: Square, label: t('annotation.tools.rectangle') },
    { id: 'polygon', icon: Pentagon, label: t('annotation.tools.polygon') },
    { id: 'circle', icon: Circle, label: t('annotation.tools.circle') },
    { id: 'line', icon: Minus, label: t('annotation.tools.line') },
    { id: 'point', icon: MapPin, label: t('annotation.tools.point') },
    { id: 'eraser', icon: Eraser, label: t('annotation.tools.eraser') },
  ];

  const actions = [
    { id: 'undo', icon: Undo, label: t('annotation.tools.undo') },
    { id: 'redo', icon: Redo, label: t('annotation.tools.redo') },
  ];

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 border-r border-neutral dark:border-neutral-dark">
      <h2 className="h2 mb-2">Tools</h2>

      {/* Drawing Tools */}
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTool === tool.id
                ? 'bg-primary text-white border-2 border-primary'
                : 'hover:bg-neutral dark:hover:bg-neutral-dark border-2 border-transparent'
            }`}
            title={tool.label}
          >
            <tool.icon size={24} />
            <span className="text-sm font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral dark:border-neutral-dark"></div>

      {/* Actions */}
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onToolChange(action.id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral dark:hover:bg-neutral-dark transition-colors"
            title={action.label}
          >
            <action.icon size={24} />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsPalette;
