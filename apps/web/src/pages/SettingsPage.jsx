import { useTranslation } from 'react-i18next';
import { Typography, Form, Select } from '@douyinfe/semi-ui';
import CardPro from '../components/common/ui/CardPro';
import { useTheme } from '../contexts/ThemeContext';

const { Title } = Typography;

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setThemeMode } = useTheme();

  const changeLanguage = (lng) => {
    try {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      // Still change the language in memory even if localStorage fails
      i18n.changeLanguage(lng);
    }
  };

  const handleDarkModeChange = (checked) => {
    setThemeMode(checked ? 'dark' : 'light');
  };

  return (
    <CardPro
      type="type1"
      descriptionArea={(
        <div className="flex flex-col gap-2">
          <Title heading={2} style={{ margin: 0 }}>
            {t('nav.settings')}
          </Title>
          <Typography.Text type="tertiary">
            {t('settings.subtitle', 'Configure your workspace preferences')}
          </Typography.Text>
        </div>
      )}
      t={t}
    >
      <div style={{ padding: '24px' }}>
        <Form layout="vertical">
          <Form.Section text={t('settings.general')}>
            <Form.Select
              field="language"
              label={t('settings.language')}
              style={{ width: 240 }}
              onChange={changeLanguage}
              initValue={i18n.language}
            >
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="zh">中文</Select.Option>
            </Form.Select>
          </Form.Section>
          <Form.Section text={t('settings.appearance')}>
            <Form.Switch
              field="darkMode"
              label={t('settings.darkMode')}
              initValue={resolvedTheme === 'dark'}
              onChange={handleDarkModeChange}
            />
          </Form.Section>
        </Form>
      </div>
    </CardPro>
  );
};

export default SettingsPage;