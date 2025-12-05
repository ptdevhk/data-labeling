import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import HeaderBar from './Header';
import SiderBar from './Sidebar';
import FooterBar from './Footer';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';

const { Sider, Content } = Layout;

const PageLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, , setCollapsed] = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerHeight = isMobile ? 56 : 64;
  const { t, i18n } = useTranslation();

  // Pages that should not have inner padding (full-screen pages)
  const shouldInnerPadding =
    !location.pathname.includes('/annotation') &&
    location.pathname.startsWith('/console');

  const isAnnotationPage = location.pathname.includes('/annotation');
  const shouldShowFooter = !isAnnotationPage && location.pathname.startsWith('/console');
  const isConsoleRoute = location.pathname.startsWith('/console');
  const showSider = isConsoleRoute && (!isMobile || drawerOpen);

  const headerOffset = `${headerHeight}px`;
  const annotationOffset = `calc(${headerHeight}px + 8px)`;
  const contentMarginTop = isAnnotationPage ? annotationOffset : headerOffset;
  const contentMinHeight = isAnnotationPage
    ? `calc(100vh - ${headerHeight}px - 8px)`
    : `calc(100vh - ${headerHeight}px)`;
  const contentOverflow = isAnnotationPage ? 'hidden' : isMobile ? 'visible' : 'auto';

  useEffect(() => {
    if (isMobile && drawerOpen && collapsed) {
      setCollapsed(false);
    }
  }, [isMobile, drawerOpen, collapsed, setCollapsed]);

  useEffect(() => {
    document.title = t('common.appName');
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language, t]);

  return (
    <Layout
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'visible' : 'hidden',
        '--header-height': headerOffset,
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
        <HeaderBar
          onMobileMenuToggle={() => setDrawerOpen((prev) => !prev)}
          drawerOpen={drawerOpen}
        />
      </Layout.Header>
      <Layout
        style={{
          overflow: isMobile ? 'visible' : 'auto',
          display: 'flex',
          flexDirection: 'column',
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
            <SiderBar
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
              flex: '1 0 auto',
              overflowY: contentOverflow,
              WebkitOverflowScrolling: 'touch',
              padding: shouldInnerPadding ? (isMobile ? '5px' : '24px') : '0',
              position: 'relative',
              marginTop: contentMarginTop,
              minHeight: contentMinHeight,
            }}
          >
            <Outlet />
          </Content>
          {shouldShowFooter && (
            <Layout.Footer style={{ padding: 0, marginTop: 'auto' }}>
              <FooterBar />
            </Layout.Footer>
          )}
        </Layout>
      </Layout>
    </Layout>
  );
};

export const MainLayout = PageLayout;

export default PageLayout;