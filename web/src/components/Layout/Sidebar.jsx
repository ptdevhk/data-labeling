import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav, Button } from '@douyinfe/semi-ui';
import {
  IconGridRectangle,
  IconFolder,
  IconGallery,
  IconUpload,
  IconSetting,
  IconChevronLeft,
} from '@douyinfe/semi-icons';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobile, onNavigate }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { itemKey: 'dashboard', text: t('nav.dashboard'), icon: <IconGridRectangle />, path: '/' },
    { itemKey: 'projects', text: t('nav.projects'), icon: <IconFolder />, path: '/projects' },
    { itemKey: 'datasets', text: t('nav.datasets'), icon: <IconGallery />, path: '/datasets' },
    { itemKey: 'exports', text: t('nav.exports'), icon: <IconUpload />, path: '/exports' },
    { itemKey: 'settings', text: t('nav.settings'), icon: <IconSetting />, path: '/settings' },
  ];

  // Get selected key based on current path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    const matchedItem = navItems.find(item => item.path !== '/' && path.startsWith(item.path));
    return matchedItem ? [matchedItem.itemKey] : ['dashboard'];
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className="sidebar-container"
      style={{
        backgroundColor: 'var(--semi-color-bg-1)',
        position: isMobile ? 'relative' : 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: '1px solid var(--semi-color-border)',
        zIndex: isMobile ? 1000 : 100,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Nav
          isCollapsed={isCollapsed}
          selectedKeys={getSelectedKey()}
          style={{
            flex: 1,
            height: '100%',
          }}
          items={navItems}
          onCollapseChange={onToggleCollapse}
          renderWrapper={({ itemElement, props }) => {
            const { path } = props;
            const link = path || '/';
            return (
              <NavLink
                style={{ textDecoration: 'none' }}
                to={link}
                onClick={handleNavigate}
              >
                {itemElement}
              </NavLink>
            );
          }}
        >
          <Nav.Header
            logo={<img src="/logo.png" alt="logo" style={{ width: 32, height: 32 }} />}
            text={!isCollapsed ? t('common.appName') : null}
          />
        </Nav>

        {/* Footer version */}
        {!isCollapsed && (
          <div
            style={{
              padding: '12px 16px',
              color: 'var(--semi-color-text-2)',
              fontSize: '12px',
              textAlign: 'center',
              borderTop: '1px solid var(--semi-color-border)',
            }}
          >
            v{__APP_VERSION__}
          </div>
        )}
        
        {/* Desktop-only collapse button */}
        {!isMobile && onToggleCollapse && (
          <div className="sidebar-collapse-button">
            <Button
              icon={<IconChevronLeft />}
              theme="borderless"
              onClick={onToggleCollapse}
              style={{
                color: 'var(--semi-color-text-2)',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;