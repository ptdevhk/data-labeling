import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@douyinfe/semi-ui';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, , setCollapsed] = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerHeight = isMobile ? 56 : 64;

  const isAnnotationPage = location.pathname.includes('/annotation');
  const shouldShowFooter = !isAnnotationPage && location.pathname.startsWith('/console');
  const shouldInnerPadding = !isAnnotationPage;
  const showSider = !isMobile || drawerOpen;

  useEffect(() => {
    if (isMobile && drawerOpen && collapsed) {
      setCollapsed(false);
    }
  }, [isMobile, drawerOpen, collapsed, setCollapsed]);

  return (
    <Layout
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'visible' : 'hidden',
      }}
    >
      <Layout.Header
        style={{
          padding: 0,
          height: 'auto',
          lineHeight: 'normal',
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 100,
        }}
      >
        <Header
          onMobileMenuToggle={() => setDrawerOpen((prev) => !prev)}
          drawerOpen={drawerOpen}
        />
      </Layout.Header>
      <Layout
        style={{
          overflow: isMobile ? 'visible' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          marginTop: `${headerHeight}px`,
        }}
      >
        {showSider && (
          <Sider
            style={{
              position: 'fixed',
              left: 0,
              top: `${headerHeight}px`,
              zIndex: 99,
              border: 'none',
              paddingRight: '0',
              height: `calc(100vh - ${headerHeight}px)`,
              width: 'var(--sidebar-current-width)',
            }}
          >
            <Sidebar
              onNavigate={() => {
                if (isMobile) setDrawerOpen(false);
              }}
            />
          </Sider>
        )}
        <Layout
          style={{
            marginLeft: isMobile
              ? '0'
              : showSider
                ? 'var(--sidebar-current-width)'
                : '0',
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Content
            style={{
              flex: '1 1 0',
              minHeight: 0,
              overflowY: isAnnotationPage ? 'hidden' : (isMobile ? 'visible' : 'auto'),
              WebkitOverflowScrolling: 'touch',
              padding: shouldInnerPadding ? (isMobile ? '5px' : '24px') : '0',
              position: 'relative',
            }}
          >
            <Outlet />
          </Content>
          {shouldShowFooter && (
            <Layout.Footer style={{ padding: 0, marginTop: 'auto' }}>
              <Footer />
            </Layout.Footer>
          )}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;