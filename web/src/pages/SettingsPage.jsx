import { useTranslation } from 'react-i18next';
import {
  Typography,
  Card,
  Form,
  Select,
  Switch,
  Button,
} from '@douyinfe/semi-ui';

const { Title } = Typography;

const SettingsPage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div>
      <Title heading={2} style={{ marginBottom: 24 }}>
        {t('nav.settings')}
      </Title>
      <Card>
        <Form layout="vertical">
          <Form.Section text={t('settings.general')}>
            <Form.Select
              field="language"
              label={t('settings.language')}
              style={{ width: 200 }}
              onChange={changeLanguage}
              value={i18n.language}
            >
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="zh">中文</Select.Option>
            </Form.Select>
          </Form.Section>
          <Form.Section text={t('settings.appearance')}>
            <Form.Switch field="darkMode" label={t('settings.darkMode')} />
          </Form.Section>
          <Button type="primary" htmlType="submit">
            {t('common.save')}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;