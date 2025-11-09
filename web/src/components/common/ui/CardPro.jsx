import React, { useState } from 'react';
import { Card, Divider, Typography, Button } from '@douyinfe/semi-ui';
import PropTypes from 'prop-types';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { IconEyeOpened, IconEyeClosed } from '@douyinfe/semi-icons';

const { Text } = Typography;

/**
 * CardPro - Advanced Card Component
 *
 * Layout divided into 6 areas:
 * 1. Stats area (statsArea)
 * 2. Description area (descriptionArea)
 * 3. Type switch/tabs area (tabsArea)
 * 4. Actions area (actionsArea)
 * 5. Search form area (searchArea)
 * 6. Pagination area (paginationArea) - fixed at card bottom
 *
 * Supports three layout types:
 * - type1: Action-oriented (e.g. TokensTable) - description + action buttons + search form
 * - type2: Query-oriented (e.g. LogsTable) - stats + search form
 * - type3: Complex (e.g. ChannelsTable) - description + type switch + action buttons + search form
 */
const CardPro = ({
  type = 'type1',
  className = '',
  children,
  // Area contents
  statsArea,
  descriptionArea,
  tabsArea,
  actionsArea,
  searchArea,
  paginationArea, // New pagination area
  // Card properties
  shadows = '',
  bordered = true,
  // Custom styles
  style,
  // i18n function
  t = (key) => key,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [showMobileActions, setShowMobileActions] = useState(false);

  const toggleMobileActions = () => {
    setShowMobileActions(!showMobileActions);
  };

  const hasMobileHideableContent = actionsArea || searchArea;

  const renderHeader = () => {
    const hasContent =
      statsArea || descriptionArea || tabsArea || actionsArea || searchArea;
    if (!hasContent) return null;

    return (
      <div className='flex flex-col w-full'>
        {/* Stats area - for type2 */}
        {type === 'type2' && statsArea && <>{statsArea}</>}

        {/* Description area - for type1 and type3 */}
        {(type === 'type1' || type === 'type3') && descriptionArea && (
          <>{descriptionArea}</>
        )}

        {/* First divider - after description or stats */}
        {((type === 'type1' || type === 'type3') && descriptionArea) ||
        (type === 'type2' && statsArea) ? (
          <Divider margin='12px' />
        ) : null}

        {/* Type switch/tabs area - mainly for type3 */}
        {type === 'type3' && tabsArea && <>{tabsArea}</>}

        {/* Mobile actions toggle button */}
        {isMobile && hasMobileHideableContent && (
          <>
            <div className='w-full mb-2'>
              <Button
                onClick={toggleMobileActions}
                icon={showMobileActions ? <IconEyeClosed /> : <IconEyeOpened />}
                type='tertiary'
                size='small'
                theme='outline'
                block
              >
                {showMobileActions ? t('hideActions') : t('showActions')}
              </Button>
            </div>
          </>
        )}

        {/* Container for action buttons and search form */}
        <div
          className={`flex flex-col gap-2 ${isMobile && !showMobileActions ? 'hidden' : ''}`}
        >
          {/* Action buttons area - for type1 and type3 */}
          {(type === 'type1' || type === 'type3') &&
            actionsArea &&
            (Array.isArray(actionsArea) ? (
              actionsArea.map((area, idx) => (
                <React.Fragment key={idx}>
                  {idx !== 0 && <Divider />}
                  <div className='w-full'>{area}</div>
                </React.Fragment>
              ))
            ) : (
              <div className='w-full'>{actionsArea}</div>
            ))}

          {/* Divider when both actions and search areas exist */}
          {actionsArea && searchArea && <Divider />}

          {/* Search form area - available for all types */}
          {searchArea && <div className='w-full'>{searchArea}</div>}
        </div>
      </div>
    );
  };

  const headerContent = renderHeader();

  // Render pagination area
  const renderFooter = () => {
    if (!paginationArea) return null;

    return (
      <div
        className={`flex w-full pt-4 border-t ${isMobile ? 'justify-center' : 'justify-between items-center'}`}
        style={{ borderColor: 'var(--semi-color-border)' }}
      >
        {paginationArea}
      </div>
    );
  };

  const footerContent = renderFooter();

  return (
    <Card
      className={`table-scroll-card !rounded-2xl ${className}`}
      title={headerContent}
      footer={footerContent}
      shadows={shadows}
      bordered={bordered}
      style={style}
      {...props}
    >
      {children}
    </Card>
  );
};

CardPro.propTypes = {
  // Layout type
  type: PropTypes.oneOf(['type1', 'type2', 'type3']),
  // Style related
  className: PropTypes.string,
  style: PropTypes.object,
  shadows: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  bordered: PropTypes.bool,
  // Content areas
  statsArea: PropTypes.node,
  descriptionArea: PropTypes.node,
  tabsArea: PropTypes.node,
  actionsArea: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  searchArea: PropTypes.node,
  paginationArea: PropTypes.node,
  // Table content
  children: PropTypes.node,
  // i18n function
  t: PropTypes.func,
};

export default CardPro;
