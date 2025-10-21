import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Table, Typography, Card } from '@douyinfe/semi-ui';
import { IconPlus, IconFolder } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

const Projects = () => {
  const { t } = useTranslation();

  const recentProjects = [
    {
      key: '1',
      name: 'Project Alpha',
      images: 150,
      labeled: 120,
      updatedAt: '2025-10-07',
    },
    {
      key: '2',
      name: 'Project Beta',
      images: 200,
      labeled: 50,
      updatedAt: '2025-10-06',
    },
    {
      key: '3',
      name: 'Project Gamma',
      images: 98,
      labeled: 98,
      updatedAt: '2025-10-05',
    },
  ];

  const columns = [
    {
      title: t('project.name'),
      dataIndex: 'name',
      render: (text, record) => (
        <NavLink to={`/console/projects/${record.key}`}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconFolder style={{ marginRight: 8, color: 'var(--semi-color-primary)' }} />
            <Text strong>{text}</Text>
          </div>
        </NavLink>
      ),
    },
    {
      title: t('console.totalImages'),
      dataIndex: 'images',
    },
    {
      title: t('console.labeledImages'),
      dataIndex: 'labeled',
    },
    {
      title: t('project.updatedAt'),
      dataIndex: 'updatedAt',
      render: (text) => <Text type="tertiary">{text}</Text>,
    },
    {
      title: t('project.actions'),
      dataIndex: 'actions',
      render: (text, record) => (
        <NavLink to={`/console/projects/${record.key}`}>
          <Button>{t('common.continue')}</Button>
        </NavLink>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title heading={2}>{t('nav.projects')}</Title>
        <Button type="primary" icon={<IconPlus />}>
          {t('console.createProject')}
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={recentProjects} />
      </Card>
    </div>
  );
};

export default Projects;