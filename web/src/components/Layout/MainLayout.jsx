import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@douyinfe/semi-ui';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';

const MainLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { collapsed, toggleCollapsed, setCollapsed } = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check if current page is annotation page
  const isAnnotationPage = location.pathname.includes('/annotation');

  // Handle auto-collapse on annotation page for desktop
  useEffect(() => {
    if (!isMobile) {
      // Desktop behavior: Auto-collapse on annotation page
      if (isAnnotationPage) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    }
  }, [isAnnotationPage, location.pathname, isMobile, setCollapsed]);

  const handleMobileMenuToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Mobile: Drawer with overlay */}
      {isMobile ? (
        <>
          {drawerOpen && (
            <>
              <div className="drawer-overlay" onClick={handleDrawerClose} />
              <div className="drawer-container">
                <Sidebar
                  isCollapsed={false}
                  isMobile={isMobile}
                  onNavigate={handleDrawerClose}
                />
              </div>
            </>
          )}
        </>
      ) : (
        /* Desktop: Always-visible sidebar */
        <Sidebar
          isCollapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          isMobile={false}
        />
      )}

      <Layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: isMobile ? 0 : 'var(--sidebar-current-width)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Header
          onToggleSidebar={isMobile ? handleMobileMenuToggle : toggleCollapsed}
          isMobile={isMobile}
        />
        <Layout.Content
          style={{
            padding: isAnnotationPage ? '0' : '24px',
            overflow: 'auto',
            flex: 1,
            minHeight: 0
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;