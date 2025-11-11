import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Nav, Divider, Button } from '@douyinfe/semi-ui';
import {
  IconGridRectangle,
  IconFolder,
  IconGallery,
  IconUpload,
  IconSetting,
  IconChevronLeft,
} from '@douyinfe/semi-icons';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';

const routerMap = {
  console: '/console',
  projects: '/console/projects',
  datasets: '/console/datasets',
  exports: '/console/exports',
  settings: '/console/settings',
};

const SiderBar = ({ onNavigate = () => {} }) => {
  const { t } = useTranslation();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const location = useLocation();

  const navItems = [
    { itemKey: 'console', text: t('nav.console'), icon: <IconGridRectangle /> },
    { itemKey: 'projects', text: t('nav.projects'), icon: <IconFolder /> },
    { itemKey: 'datasets', text: t('nav.datasets'), icon: <IconGallery /> },
    { itemKey: 'exports', text: t('nav.exports'), icon: <IconUpload /> },
    { itemKey: 'settings', text: t('nav.settings'), icon: <IconSetting /> },
  ];

  const selectedKeys = useMemo(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMap).find(
      (key) => routerMap[key] === currentPath,
    );

    if (!matchingKey) {
      const matchedItem = Object.keys(routerMap).find(
        (key) => routerMap[key] !== '/' && currentPath.startsWith(routerMap[key]),
      );
      matchingKey = matchedItem || 'console';
    }

    return [matchingKey];
  }, [location.pathname]);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  const SELECTED_COLOR = 'var(--semi-color-primary)';

  const renderNavItem = (item) => {
    const isSelected = selectedKeys.includes(item.itemKey);
    const textColor = isSelected ? SELECTED_COLOR : 'inherit';

    return (
      <Nav.Item
        key={item.itemKey}
        itemKey={item.itemKey}
        text={
          <span
            className='truncate font-medium text-sm'
            style={{ color: textColor }}
          >
            {item.text}
          </span>
        }
        icon={
          <div className='sidebar-icon-container flex-shrink-0'>
            {item.icon}
          </div>
        }
      />
    );
  };

  return (
    <div
      className='sidebar-container'
      style={{
        width: 'var(--sidebar-current-width)',
        background: 'var(--semi-color-bg-0)',
      }}
    >
      <Nav
        className='sidebar-nav'
        defaultIsCollapsed={collapsed}
        isCollapsed={collapsed}
        onCollapseChange={toggleCollapsed}
        selectedKeys={selectedKeys}
        renderWrapper={({ itemElement, props }) => {
          const to = routerMap[props.itemKey];

          if (!to) return itemElement;

          return (
            <Link
              style={{ textDecoration: 'none' }}
              to={to}
              onClick={onNavigate}
            >
              {itemElement}
            </Link>
          );
        }}
      >
        <Divider className='sidebar-divider' style={{ marginTop: '12px' }} />

        <div className='sidebar-section'>
          {!collapsed && (
            <div className='sidebar-group-label'>{t('nav.workspace')}</div>
          )}
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </Nav>

      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            color: 'var(--semi-color-text-2)',
            fontSize: '12px',
            textAlign: 'center',
            borderTop: '1px solid var(--semi-color-border)',
          }}
        >
          v{__APP_VERSION__ || '1.0.0'}
        </div>
      )}

      <div className='sidebar-collapse-button'>
        <Button
          theme='outline'
          type='tertiary'
          size='small'
          icon={
            <IconChevronLeft
              size={16}
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            />
          }
          onClick={toggleCollapsed}
          style={
            collapsed
              ? { width: 36, height: 24, padding: 0 }
              : { padding: '4px 12px', width: '100%' }
          }
        >
          {!collapsed ? t('nav.collapseSidebar') : null}
        </Button>
      </div>
    </div>
  );
};

export const Sidebar = SiderBar;

export default SiderBar;