import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Typography } from '@douyinfe/semi-ui';
import {
  IconPlus,
  IconFolder,
  IconGallery,
  IconCheckCircleStroked,
  IconBarChartVStroked,
  IconExternalOpen,
} from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Console = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = useMemo(
    () => [
      {
        label: t('console.totalProjects'),
        value: '0',
        icon: <IconFolder />,
        accent: 'console-stat-primary',
        helper: t('console.projectStats'),
      },
      {
        label: t('console.totalImages'),
        value: '0',
        icon: <IconGallery />,
        accent: 'console-stat-success',
        helper: t('console.totalImages'),
      },
      {
        label: t('console.labeledImages'),
        value: '0',
        icon: <IconCheckCircleStroked />,
        accent: 'console-stat-warning',
        helper: t('console.labeledImages'),
      },
      {
        label: t('console.completionRate'),
        value: '0%',
        icon: <IconBarChartVStroked />,
        accent: 'console-stat-info',
        helper: t('console.completionRate'),
      },
    ],
    [t],
  );

  return (
    <div className="console-page">
      <Card
        bordered={false}
        className="console-hero"
        title={
          <div className="console-hero__titles">
            <Text strong className="console-hero__title">
              {t('console.title')}
            </Text>
            <Text type="tertiary" className="console-hero__subtitle">
              {t('console.subtitle')}
            </Text>
          </div>
        }
        headerExtraContent={
          <div className="console-hero__actions">
            <Button
              icon={<IconPlus />}
              theme="solid"
              type="primary"
              onClick={() => navigate('/projects')}
            >
              {t('console.createProject')}
            </Button>
            <Button
              icon={<IconExternalOpen />}
              theme="light"
              onClick={() => navigate('/projects')}
            >
              {t('common.view')}
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      />

      <section className="console-stats" aria-label={t('console.projectStats')}>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            bordered={false}
            className={`console-stats-card ${stat.accent}`}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="console-stats-card__icon">{stat.icon}</div>
            <div className="console-stats-card__content">
              <Text className="console-stats-card__helper" type="tertiary">
                {stat.helper}
              </Text>
              <Title heading={3} className="console-stats-card__value">
                {stat.value}
              </Title>
              <Text className="console-stats-card__label">{stat.label}</Text>
            </div>
          </Card>
        ))}
      </section>

      <section className="console-main-grid">
        <Card
          bordered={false}
          className="console-card"
          title={t('console.recentProjects')}
          headerExtraContent={
            <Button size="small" onClick={() => navigate('/projects')}>
              {t('common.viewAll', 'View All')}
            </Button>
          }
          bodyStyle={{ padding: '32px' }}
        >
          <div className="console-empty-state">
            <div className="console-empty-state__content">
              <Text type="tertiary">{t('console.noProjects')}</Text>
              <Button
                size="large"
                theme="solid"
                type="primary"
                icon={<IconPlus />}
                onClick={() => navigate('/projects')}
              >
                {t('console.createProject')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="console-side-column">
          <Card
            bordered={false}
            className="console-card console-card--compact"
            title={t('console.projectStats')}
            bodyStyle={{ padding: '28px' }}
          >
            <ul className="console-resource-list">
              <li>
                <div>
                  <Text strong>{t('footer.exportFormats')}</Text>
                  <Text type="tertiary">{t('console.totalImages')}</Text>
                </div>
                <Button
                  theme="borderless"
                  icon={<IconExternalOpen />}
                  aria-label={t('footer.exportFormats')}
                  onClick={() => navigate('/exports')}
                />
              </li>
              <li>
                <div>
                  <Text strong>{t('footer.settings')}</Text>
                  <Text type="tertiary">{t('console.labeledImages')}</Text>
                </div>
                <Button
                  theme="borderless"
                  icon={<IconExternalOpen />}
                  aria-label={t('footer.settings')}
                  onClick={() => navigate('/settings')}
                />
              </li>
              <li>
                <div>
                  <Text strong>{t('footer.documentation')}</Text>
                  <Text type="tertiary">{t('console.projectStats')}</Text>
                </div>
                <Button
                  theme="borderless"
                  icon={<IconExternalOpen />}
                  aria-label={t('footer.documentation')}
                  onClick={() => window.open('https://github.com/quantumnous/data-labeling', '_blank')}
                />
              </li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Console;