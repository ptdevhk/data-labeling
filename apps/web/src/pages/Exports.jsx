import { useTranslation } from 'react-i18next';
import { Button, Table, Typography, Tag } from '@douyinfe/semi-ui';
import { IconDownload } from '@douyinfe/semi-icons';
import CardPro from '../components/common/ui/CardPro';

const { Title, Text } = Typography;

const Exports = () => {
  const { t } = useTranslation();

  const exports = [
    {
      key: '1',
      name: 'Project Alpha Export',
      format: 'COCO JSON',
      status: 'Completed',
      createdAt: '2025-10-07',
    },
    {
      key: '2',
      name: 'Project Beta Export',
      format: 'YOLO TXT',
      status: 'In Progress',
      createdAt: '2025-10-06',
    },
    {
      key: '3',
      name: 'Project Gamma Export',
      format: 'CSV',
      status: 'Failed',
      createdAt: '2025-10-05',
    },
  ];

  const columns = [
    {
      title: t('export.name'),
      dataIndex: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: t('export.format'),
      dataIndex: 'format',
    },
    {
      title: t('export.status'),
      dataIndex: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'Completed':
            color = 'green';
            break;
          case 'In Progress':
            color = 'blue';
            break;
          case 'Failed':
            color = 'red';
            break;
          default:
            color = 'grey';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('export.createdAt'),
      dataIndex: 'createdAt',
      render: (text) => <Text type="tertiary">{text}</Text>,
    },
    {
      title: t('project.actions'),
      dataIndex: 'actions',
      render: () => <Button icon={<IconDownload />} theme="borderless" />,
    },
  ];

  return (
    <CardPro
      type="type1"
      descriptionArea={(
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Title heading={2} style={{ margin: 0 }}>
              {t('nav.exports')}
            </Title>
            <Text type="tertiary">
              {t('export.subtitle', 'Review generated files and monitor export status')}
            </Text>
          </div>
        </div>
      )}
      actionsArea={(
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <Button type="primary" icon={<IconDownload />}>
            {t('export.newJob', 'New export job')}
          </Button>
        </div>
      )}
      t={t}
    >
      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={exports} />
      </div>
    </CardPro>
  );
};

export default Exports;