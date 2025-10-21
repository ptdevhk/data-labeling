import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button, Avatar, Dropdown } from '@douyinfe/semi-ui';
import {
  IconMoon,
  IconSun,
  IconMenu,
  IconLanguage,
  IconDesktop,
} from '@douyinfe/semi-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useNavigation } from '../../hooks/useNavigation';

const Header = ({ onMobileMenuToggle }) => {
  const { t, i18n } = useTranslation();
  const { theme, resolvedTheme, setThemeMode } = useTheme();
  const isMobile = useIsMobile();
  const [, toggleCollapsed] = useSidebarCollapsed();
  const location = useLocation();
  const { mainNavLinks } = useNavigation(t);

  const isConsoleRoute = location.pathname.startsWith('/console') || 
                        location.pathname.startsWith('/projects') || 
                        location.pathname.startsWith('/datasets') ||
                        location.pathname.startsWith('/exports') ||
                        location.pathname.startsWith('/settings');

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

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'zh', label: '中文' },
  ];

  const themeOptions = [
    {
      key: 'light',
      icon: <IconSun size={18} />,
      label: t('common.lightMode'),
      description: t('common.alwaysLight'),
    },
    {
      key: 'dark',
      icon: <IconMoon size={18} />,
      label: t('common.darkMode'),
      description: t('common.alwaysDark'),
    },
    {
      key: 'auto',
      icon: <IconDesktop size={18} />,
      label: t('common.autoMode'),
      description: t('common.followSystem'),
    },
  ];

  const getCurrentThemeIcon = () => {
    if (resolvedTheme === 'dark') return <IconMoon size={18} />;
    if (resolvedTheme === 'light') return <IconSun size={18} />;
    return <IconDesktop size={18} />;
  };

  const handleThemeModeChange = (newTheme) => {
    if (newTheme !== theme) {
      setThemeMode(newTheme);
    }
  };

  return (
    <header className='text-semi-color-text-0 sticky top-0 z-50 transition-colors duration-300 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-lg'>
      <div className='w-full px-2'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center'>
              {/* Mobile Menu Button - Only shows on mobile AND console routes */}
              {isConsoleRoute && isMobile && (
                <Button
                  icon={<IconMenu className="text-lg" />}
                  theme="borderless"
                  type="tertiary"
                  className='!p-2 !text-current focus:!bg-semi-color-fill-1 dark:focus:!bg-gray-700'
                  onClick={handleMenuToggle}
                  aria-label={t('common.openMenu')}
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
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-semibold'>
                    {t('common.appName')}
                  </span>
                  {import.meta.env.DEV && (
                    <span className='text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'>
                      Dev
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            {!isMobile && (
              <nav className='flex items-center gap-1 ml-4'>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.itemKey}
                    to={link.to}
                    className={`
                      px-3 py-2 rounded-md font-semibold text-sm
                      transition-all duration-200 ease-in-out
                      hover:text-semi-color-primary
                      ${isActiveLink(link.to)
                        ? 'text-semi-color-primary bg-semi-color-primary/10'
                        : 'text-semi-color-text-0'
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
            {/* Language Selector */}
            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu className='!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600'>
                  {languageOptions.map((option) => (
                    <Dropdown.Item
                      key={option.value}
                      onClick={() => changeLanguage(option.value)}
                      className={`!flex !items-center !gap-2 !px-3 !py-1.5 !text-sm !text-semi-color-text-0 dark:!text-gray-200 transition-colors ${
                        i18n.language === option.value
                          ? '!bg-semi-color-primary-light-default dark:!bg-blue-600 !font-semibold'
                          : 'hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-600'
                      }`}
                    >
                      <span>{option.label}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              }
            >
              <Button
                icon={<IconLanguage size={18} />}
                theme="borderless"
                type="tertiary"
                className='!p-1.5 !text-current focus:!bg-semi-color-fill-1 dark:focus:!bg-gray-700 !rounded-full !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 hover:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2 transition-colors'
                aria-label={t('common.changeLanguage')}
              />
            </Dropdown>

            {/* Theme Toggle */}
            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu className='!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600'>
                  {themeOptions.map((option) => (
                    <Dropdown.Item
                      key={option.key}
                      icon={option.icon}
                      onClick={() => handleThemeModeChange(option.key)}
                      className={`!px-3 !py-1.5 transition-colors ${
                        theme === option.key
                          ? '!bg-semi-color-primary-light-default dark:!bg-blue-600 !font-semibold'
                          : 'hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-600'
                      }`}
                    >
                      <div className='flex flex-col'>
                        <span className='!text-sm !text-semi-color-text-0 dark:!text-gray-200'>{option.label}</span>
                        <span className='text-xs text-semi-color-text-2 dark:text-gray-400'>
                          {option.description}
                        </span>
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              }
            >
              <Button
                icon={getCurrentThemeIcon()}
                theme="borderless"
                type="tertiary"
                className='!p-1.5 !text-current focus:!bg-semi-color-fill-1 dark:focus:!bg-gray-700 !rounded-full !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 hover:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2 transition-colors'
                aria-label={t('common.toggleTheme')}
              />
            </Dropdown>

            {/* User Dropdown */}
            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu className='!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600'>
                  <Dropdown.Item
                    onClick={() => window.location.href = '/settings'}
                    className='!px-3 !py-1.5 !text-sm !text-semi-color-text-0 hover:!bg-semi-color-fill-1 dark:!text-gray-200 dark:hover:!bg-blue-500 dark:hover:!text-white transition-colors'
                  >
                    {t('common.profile')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => window.location.href = '/settings'}
                    className='!px-3 !py-1.5 !text-sm !text-semi-color-text-0 hover:!bg-semi-color-fill-1 dark:!text-gray-200 dark:hover:!bg-blue-500 dark:hover:!text-white transition-colors'
                  >
                    {t('common.settings')}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/';
                    }}
                    className='!px-3 !py-1.5 !text-sm !text-semi-color-text-0 hover:!bg-semi-color-fill-1 dark:!text-gray-200 dark:hover:!bg-red-500 dark:hover:!text-white transition-colors'
                  >
                    {t('common.logout')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <Button
                theme='borderless'
                type='tertiary'
                className='flex items-center gap-1.5 !p-1 !rounded-full hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-700 !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2 transition-colors'
              >
                <Avatar color="blue" size="extra-small">
                  U
                </Avatar>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;