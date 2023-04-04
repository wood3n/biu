import React from 'react';
import {
  Typography, Image, Space, Modal, Avatar, Tooltip,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useBoolean } from 'ahooks';
import type { Album } from '@service/album';
import { formatMillisecond } from '@/common/utils';
import { IMAGE_ERR } from '@/common/constants';
import SimpleBar from 'simplebar-react';
import styles from './index.module.less';

const AlbumDescription: React.FC<Album> = ({
  name,
  picUrl,
  description,
  artists,
  company,
  size,
  publishTime,
}) => {
  const navigate = useNavigate();
  const [open, { toggle }] = useBoolean();

  return (
    <div className={styles.albumDescription}>
      <Image
        preview={false}
        width={200}
        height={200}
        src={picUrl}
        fallback={IMAGE_ERR}
        className={styles.coverImage}
      />
      <Space direction="vertical">
        <Typography.Title>{name}</Typography.Title>
        <Avatar.Group size="large">
          {artists?.map(({
            picUrl, name, id,
          }) => (
            <Tooltip key={id} title={name} placement="top">
              <Avatar src={picUrl} onClick={() => navigate(`/artist/${id}`)} style={{ cursor: 'pointer' }} />
            </Tooltip>
          ))}
        </Avatar.Group>
        <Typography.Text>
          发布时间：
          {formatMillisecond(publishTime)}
        </Typography.Text>
        {company && (
          <Typography.Text>
            唱片公司：
            {company}
          </Typography.Text>
        )}
        <Typography.Text>
          歌曲数：
          {size}
        </Typography.Text>
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: (
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
              >
                更多
              </a>
            ),
          }}
          style={{
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </Typography.Paragraph>
      </Space>
      <Modal
        centered
        maskClosable
        open={open}
        onCancel={toggle}
        closeIcon={false}
        width={600}
        footer={null}
      >
        <Typography.Title>
          {name}
        </Typography.Title>
        <Avatar.Group size="large" style={{ marginBottom: 16 }}>
          {artists?.map(({ picUrl, name, id }) => (
            <Tooltip key={id} title={name} placement="top">
              <Avatar src={picUrl} onClick={() => navigate(`/artist/${id}`)} style={{ cursor: 'pointer' }} />
            </Tooltip>
          ))}
        </Avatar.Group>
        <SimpleBar style={{ height: 420 }}>
          <Typography.Paragraph
            style={{
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </Typography.Paragraph>
        </SimpleBar>
      </Modal>
    </div>
  );
};

export default AlbumDescription;
