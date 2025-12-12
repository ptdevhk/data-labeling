import { useTranslation } from 'react-i18next';
import { Typography, Form, Select, Switch, Button } from '@douyinfe/semi-ui';
import CardPro from '../components/common/ui/CardPro';

const { Title } = Typography;

const SettingsPage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
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
      </div>
    </CardPro>
  );
};

export default SettingsPage;