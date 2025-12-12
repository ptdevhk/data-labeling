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
      },
      {
        label: t('console.totalImages'),
        value: '0',
        icon: <IconGallery />,
        accent: 'console-stat-success',
      },
      {
        label: t('console.labeledImages'),
        value: '0',
        icon: <IconCheckCircleStroked />,
        accent: 'console-stat-warning',
      },
      {
        label: t('console.completionRate'),
        value: '0%',
        icon: <IconBarChartVStroked />,
        accent: 'console-stat-info',
      },
    ],
    [t],
  );

  const quickActions = useMemo(
    () => [
      {
        label: t('console.createProject'),
        icon: <IconPlus />,
        onClick: () => navigate('/console/projects'),
      },
      {
        label: t('nav.datasets'),
        icon: <IconGallery />,
        onClick: () => navigate('/console/datasets'),
      },
      {
        label: t('nav.exports'),
        icon: <IconExternalOpen />,
        onClick: () => navigate('/console/exports'),
      },
    ],
    [navigate, t],
  );

  return (
    <div className="console">
      <section className="console-stats-grid" aria-label={t('console.projectStats')}>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            bordered={false}
            className="console-stat-card"
            bodyStyle={{ padding: '20px 22px' }}
          >
            <div className="console-stat-card__inner">
              <div className={`console-stat-card__icon ${stat.accent}`}>{stat.icon}</div>
              <div className="console-stat-card__content">
                <Text className="console-stat-card__label">{stat.label}</Text>
                <Title heading={4} className="console-stat-card__value">
                  {stat.value}
                </Title>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="console-content-grid">
        <div className="console-content-grid__primary">
          <Card
            bordered={false}
            className="console-card"
            title={t('console.recentProjects')}
            headerExtraContent={
              <Button size="small" onClick={() => navigate('/console/projects')}>
                {t('common.viewAll', 'View All')}
              </Button>
            }
            bodyStyle={{ padding: '26px' }}
          >
            <div className="console-empty-state">
              <div className="console-empty-state__content">
                <Text type="tertiary">{t('console.noProjects')}</Text>
                <Button
                  size="large"
                  theme="solid"
                  type="primary"
                  icon={<IconPlus />}
                  onClick={() => navigate('/console/projects')}
                >
                  {t('console.createProject')}
                </Button>
              </div>
            </div>
          </Card>

          <Card
            bordered={false}
            className="console-card console-card--muted"
            title={t('console.projectActivity', 'Project Activity')}
            bodyStyle={{ padding: '26px' }}
          >
            <div className="console-empty-state console-empty-state--compact">
              <div className="console-empty-state__content">
                <Text type="tertiary">{t('console.noActivity', 'Activity will appear here once you start labeling.')}</Text>
              </div>
            </div>
          </Card>
        </div>

        <aside className="console-content-grid__secondary">
          <Card
            bordered={false}
            className="console-card console-card--compact"
            title={t('console.quickActions', 'Quick Actions')}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="console-quick-actions">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  icon={action.icon}
                  theme="light"
                  block
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default Console;