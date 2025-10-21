import { NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Card, Table, Button } from '@douyinfe/semi-ui';
import { IconImage } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

const ProjectDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  // Mock data
  const projectName = `Project ${id}`;
  const imageDatasets = [
    { key: '1', name: 'image_001.jpg', status: 'Labeled' },
    { key: '2', name: 'image_002.jpg', status: 'Unlabeled' },
    { key: '3', name: 'image_003.jpg', status: 'Labeled' },
  ];

  const columns = [
    {
      title: t('dataset.imageName'),
      dataIndex: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconImage style={{ marginRight: 8, color: 'var(--semi-color-primary)' }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: t('dataset.status'),
      dataIndex: 'status',
    },
    {
      title: t('project.actions'),
      dataIndex: 'actions',
      render: (text, record) => (
        <NavLink to={`/console/annotation/${record.key}`}>
          <Button>{t('common.annotate')}</Button>
        </NavLink>
      ),
    },
  ];

  return (
    <div>
      <Title heading={2} style={{ marginBottom: 24 }}>
        {projectName}
      </Title>
      <Card>
        <Table columns={columns} dataSource={imageDatasets} />
      </Card>
    </div>
  );
};

export default ProjectDetail;
