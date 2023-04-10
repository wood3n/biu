import React from 'react';
import { Card, Typography } from 'antd';
import './index.less';

interface Props {
  imgUrl?: string;
  title: React.ReactNode;
}

const ImageCard: React.FC<Props> = ({
  imgUrl,
  title,
}) => (
  <Card
    hoverable
    cover={<img src={imgUrl} />}
    bordered={false}
    className="image-card"
  >
    <Card.Meta title={<Typography.Title level={5} ellipsis={{ tooltip: title }}>{title}</Typography.Title>} />
  </Card>
);

export default ImageCard;
