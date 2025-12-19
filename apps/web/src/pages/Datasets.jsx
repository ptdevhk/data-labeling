import { useTranslation } from 'react-i18next';
import { Button, Table, Typography } from '@douyinfe/semi-ui';
import { IconPlus, IconImage } from '@douyinfe/semi-icons';
import CardPro from '../components/common/ui/CardPro';

const { Title, Text } = Typography;

const Datasets = () => {
  const { t } = useTranslation();

  const datasets = [
    {
      key: '1',
      name: 'COCO 2017',
      images: 118287,
      createdAt: '2025-10-01',
    },
    {
      key: '2',
      name: 'Pascal VOC 2012',
      images: 11530,
      createdAt: '2025-09-15',
    },
    {
      key: '3',
      name: 'Cityscapes',
      images: 5000,
      createdAt: '2025-08-20',
    },
  ];

  const columns = [
    {
      title: t('dataset.name'),
      dataIndex: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconImage style={{ marginRight: 8, color: 'var(--semi-color-primary)' }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: t('dataset.images'),
      dataIndex: 'images',
    },
    {
      title: t('dataset.createdAt'),
      dataIndex: 'createdAt',
      render: (text) => <Text type="tertiary">{text}</Text>,
    },
    {
      title: t('project.actions'),
      dataIndex: 'actions',
      render: () => <Button theme="borderless">{t('common.view')}</Button>,
    },
  ];

  return (
    <CardPro
      type="type1"
      descriptionArea={(
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Title heading={2} style={{ margin: 0 }}>
              {t('nav.datasets')}
            </Title>
            <Text type="tertiary">
              {t('dataset.subtitle', 'Manage your dataset library and uploads')}
            </Text>
          </div>
        </div>
      )}
      actionsArea={(
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <Button type="primary" icon={<IconPlus />}>
            {t('dataset.upload')}
          </Button>
        </div>
      )}
      t={t}
    >
      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={datasets} />
      </div>
    </CardPro>
  );
};

export default Datasets;