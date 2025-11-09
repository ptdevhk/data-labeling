import React from 'react';
import { Space, Tag, Typography, Popover } from '@douyinfe/semi-ui';

const { Text } = Typography;

// General render function: limit item count display, supports popover expansion
export function renderLimitedItems({ items, renderItem, maxDisplay = 3 }) {
  if (!items || items.length === 0) return '-';
  const displayItems = items.slice(0, maxDisplay);
  const remainingItems = items.slice(maxDisplay);
  return (
    <Space spacing={1} wrap>
      {displayItems.map((item, idx) => renderItem(item, idx))}
      {remainingItems.length > 0 && (
        <Popover
          content={
            <div className='p-2'>
              <Space spacing={1} wrap>
                {remainingItems.map((item, idx) => renderItem(item, idx))}
              </Space>
            </div>
          }
          position='top'
        >
          <Tag size='small' shape='circle' color='grey'>
            +{remainingItems.length}
          </Tag>
        </Popover>
      )}
    </Space>
  );
}

// Render description field, long text supports tooltip
export const renderDescription = (text, maxWidth = 200) => {
  return (
    <Text ellipsis={{ showTooltip: true }} style={{ maxWidth }}>
      {text || '-'}
    </Text>
  );
};
