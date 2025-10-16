import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Table,
  Tag,
  Progress,
} from '@douyinfe/semi-ui';
import {
  IconPlus,
  IconFolder,
  IconImage,
  IconTickCircle,
} from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('dashboard.totalProjects'),
      value: '12',
      icon: <IconFolder size="extra-large" style={{ color: 'var(--semi-color-primary)' }} />,
    },
    {
      label: t('dashboard.totalImages'),
      value: '1248',
      icon: <IconImage size="extra-large" style={{ color: 'var(--semi-color-success)' }} />,
    },
    {
      label: t('dashboard.labeledImages'),
      value: '876',
      icon: <IconTickCircle size="extra-large" style={{ color: 'var(--semi-color-primary)' }} />,
    },
    {
      label: t('dashboard.completionRate'),
      value: '70%',
      icon: <IconTickCircle size="extra-large" style={{ color: 'var(--semi-color-success)' }} />,
    },
  ];

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
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconFolder style={{ marginRight: 8, color: 'var(--semi-color-primary)' }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: t('dashboard.totalImages'),
      dataIndex: 'images',
    },
    {
      title: t('dashboard.labeledImages'),
      dataIndex: 'labeled',
    },
    {
      title: t('dashboard.completionRate'),
      dataIndex: 'labeled',
      render: (labeled, record) => (
        <Progress
          percent={Math.round((labeled / record.images) * 100)}
          style={{ width: 120 }}
          aria-label="completion rate"
        />
      ),
    },
    {
      title: t('project.updatedAt'),
      dataIndex: 'updatedAt',
      render: (text) => <Text type="tertiary">{text}</Text>,
    },
    {
      title: t('project.actions'),
      dataIndex: 'actions',
      render: () => <Button theme="borderless">{t('common.edit')}</Button>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title heading={2}>{t('dashboard.title')}</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<IconPlus />}>
            {t('dashboard.createProject')}
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              bodyStyle={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Title heading={3} style={{ marginBottom: 8 }}>{stat.value}</Title>
                <Text type="tertiary">{stat.label}</Text>
              </div>
              {stat.icon}
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<Title heading={3}>{t('dashboard.recentProjects')}</Title>}>
        <Table columns={columns} dataSource={recentProjects} pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;