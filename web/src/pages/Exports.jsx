import { useTranslation } from 'react-i18next';
import { Button, Table, Typography, Card, Tag } from '@douyinfe/semi-ui';
import { IconDownload } from '@douyinfe/semi-icons';

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title heading={2}>{t('nav.exports')}</Title>
      </div>
      <Card>
        <Table columns={columns} dataSource={exports} />
      </Card>
    </div>
  );
};

export default Exports;