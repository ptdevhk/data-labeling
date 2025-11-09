import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import PropTypes from 'prop-types';
import { useIsMobile } from '../../../hooks/common/useIsMobile';

/**
 * Compact Mode Toggle Component
 * Used to switch between adaptive list and compact list
 * Automatically hidden on mobile, as mobile uses "Show Actions" button to control content display
 */
const CompactModeToggle = ({
  compactMode,
  setCompactMode,
  t,
  size = 'small',
  type = 'tertiary',
  className = '',
  ...props
}) => {
  const isMobile = useIsMobile();

  // Hide compact list toggle button on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Button
      type={type}
      size={size}
      className={`w-full md:w-auto ${className}`}
      onClick={() => setCompactMode(!compactMode)}
      {...props}
    >
      {compactMode ? t('adaptiveList') : t('compactList')}
    </Button>
  );
};

CompactModeToggle.propTypes = {
  compactMode: PropTypes.bool.isRequired,
  setCompactMode: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default CompactModeToggle;
