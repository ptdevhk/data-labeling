import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button, Select, Avatar, Dropdown } from '@douyinfe/semi-ui';
import {
  IconMoon,
  IconSun,
  IconBell,
  IconMenu,
} from '@douyinfe/semi-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useNavigation } from '../../hooks/useNavigation';

const Header = ({ onMobileMenuToggle }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [, toggleCollapsed] = useSidebarCollapsed();
  const location = useLocation();
  const { mainNavLinks } = useNavigation(t);

  const isAnnotationPage = location.pathname.includes('/annotation');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleMenuToggle = () => {
    if (isMobile) {
      onMobileMenuToggle();
    } else {
      toggleCollapsed();
    }
  };

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className='text-semi-color-text-0 sticky top-0 z-50 transition-colors duration-300 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-lg'>
      <div className='w-full px-2'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center'>
              {!isAnnotationPage && (
                <Button
                  icon={<IconMenu size="large" />}
                  theme="borderless"
                  style={{
                    color: 'var(--semi-color-text-2)',
                    marginRight: '12px',
                  }}
                  onClick={handleMenuToggle}
                  aria-label={isMobile ? t('common.openMenu') : t('common.toggleSidebar')}
                />
              )}

              <img
                src="/logo.png"
                alt="logo"
                style={{ width: 32, height: 32, marginRight: 8 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {!isMobile && (
                <span className='text-lg font-semibold'>
                  {t('common.appName')}
                </span>
              )}
            </div>

            {/* Navigation Links */}
            {!isMobile && (
              <nav className='flex items-center gap-1'>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.itemKey}
                    to={link.to}
                    className={`
                      px-3 py-1.5 rounded-md font-medium text-sm
                      transition-all duration-200
                      ${isActiveLink(link.to)
                        ? 'text-semi-color-primary bg-semi-color-primary/10'
                        : 'text-semi-color-text-0 hover:text-semi-color-primary hover:bg-semi-color-fill-0'
                      }
                    `}
                  >
                    {link.text}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {!isMobile && (
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                style={{ width: 100 }}
                size='small'
              >
                <Select.Option value="en">EN</Select.Option>
                <Select.Option value="vi">VI</Select.Option>
                <Select.Option value="zh">中文</Select.Option>
              </Select>
            )}

            <Button
              icon={theme === 'light' ? <IconMoon size="large" /> : <IconSun size="large" />}
              theme="borderless"
              style={{
                color: 'var(--semi-color-text-2)',
              }}
              onClick={toggleTheme}
              aria-label={t('common.toggleTheme')}
            />

            {!isMobile && (
              <Button
                icon={<IconBell size="large" />}
                theme="borderless"
                style={{
                  color: 'var(--semi-color-text-2)',
                }}
                aria-label={t('common.notifications')}
              />
            )}

            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item>{t('common.profile')}</Dropdown.Item>
                  <Dropdown.Item>{t('common.settings')}</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item>{t('common.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <span>
                <Avatar color="blue" size="small">
                  U
                </Avatar>
              </span>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;