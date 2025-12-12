import { NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Table, Button } from '@douyinfe/semi-ui';
import { IconImage } from '@douyinfe/semi-icons';
import CardPro from '../components/common/ui/CardPro';

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
    <CardPro
      type="type1"
      descriptionArea={(
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Title heading={2} style={{ margin: 0 }}>
              {projectName}
            </Title>
            <Text type="tertiary">
              {t('project.subtitleDetail', 'Review images and launch annotation sessions')}
            </Text>
          </div>
        </div>
      )}
      t={t}
    >
      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={imageDatasets} />
      </div>
    </CardPro>
  );
};

export default ProjectDetail;
