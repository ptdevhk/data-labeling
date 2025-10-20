import { useTranslation } from 'react-i18next';
import { Card, Button, Typography, Space } from '@douyinfe/semi-ui';
import { IconPlus } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Console = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    { label: t('dashboard.totalProjects'), value: '0', color: 'blue' },
    { label: t('dashboard.totalImages'), value: '0', color: 'green' },
    { label: t('dashboard.labeledImages'), value: '0', color: 'orange' },
    { label: t('dashboard.completionRate'), value: '0%', color: 'purple' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space vertical spacing="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title heading={2}>{t('dashboard.title')}</Title>
            <Text type="tertiary">{t('dashboard.subtitle', 'Overview of your annotation projects')}</Text>
          </div>
          <Button
            icon={<IconPlus />}
            theme="solid"
            type="primary"
            onClick={() => navigate('/projects')}
          >
            {t('dashboard.createProject')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          {stats.map((stat, index) => (
            <Card
              key={index}
              style={{ 
                textAlign: 'center',
                borderLeft: `4px solid var(--semi-color-${stat.color})`
              }}
            >
              <Title heading={3} style={{ margin: '8px 0' }}>{stat.value}</Title>
              <Text type="secondary">{stat.label}</Text>
            </Card>
          ))}
        </div>

        {/* Recent Projects Section */}
        <Card
          title={t('dashboard.recentProjects')}
          headerExtraContent={
            <Button size="small" onClick={() => navigate('/projects')}>
              {t('common.viewAll', 'View All')}
            </Button>
          }
        >
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: 'var(--semi-color-text-2)'
          }}>
            <Text>{t('dashboard.noProjects', 'No projects yet. Create your first project to get started.')}</Text>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default Console;