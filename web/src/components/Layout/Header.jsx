import { useTranslation } from 'react-i18next';
import { Layout, Nav, Avatar, Dropdown, Select, Button } from '@douyinfe/semi-ui';
import {
  IconMoon,
  IconSun,
  IconSearch,
  IconBell,
  IconMenu,
} from '@douyinfe/semi-icons';
import { useTheme } from '@/contexts/ThemeContext';

const { Header: SemiHeader } = Layout;

const Header = ({ onToggleSidebar, isMobile }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <SemiHeader style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
      <Nav
        mode="horizontal"
        header={
          <Button
            icon={<IconMenu size="large" />}
            theme="borderless"
            style={{
              color: 'var(--semi-color-text-2)',
              marginRight: '12px',
            }}
            onClick={onToggleSidebar}
            aria-label={isMobile ? t('common.openMenu') : t('common.toggleSidebar')}
          />
        }
        footer={
          <>
            {/* Hide language selector on mobile to save space */}
            {!isMobile && (
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                style={{ width: 100, marginRight: '12px' }}
                size={isMobile ? 'small' : 'default'}
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
                marginRight: '12px',
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
                  marginRight: '12px',
                }}
                aria-label={t('common.notifications')}
              />
            )}

            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item>{t('common.settings')}</Dropdown.Item>
                  <Dropdown.Item>{t('common.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <span>
                <Avatar color="orange" size="small">
                  U
                </Avatar>
              </span>
            </Dropdown>
          </>
        }
      ></Nav>
    </SemiHeader>
  );
};

export default Header;