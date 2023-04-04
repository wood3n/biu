import React from 'react';
import {
  Row, Col, Card, Typography,
} from 'antd';
import { useRequest } from 'ahooks';
import PageContainer from '@/components/PageContainer';
import { getRecommendResource, getProgramRecommend, getPersonalizedNewsong } from '@/service';

/**
 * 主页
 */
function Home() {
  const { data: recommendResource } = useRequest(getRecommendResource);

  const { data: programRecommend } = useRequest(getProgramRecommend);

  const { data: personalizedNewsong } = useRequest(getPersonalizedNewsong);

  return (
    <PageContainer>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>推荐歌单</Typography.Title>
      <Row gutter={[24, 24]}>
        {recommendResource?.recommend?.map(({ id, name, picUrl }) => (
          <Col span={6} key={id}>
            <Card hoverable cover={<img alt={name} src={picUrl} />} bordered={false}>
              <Card.Meta title={name} />
            </Card>
          </Col>
        ))}
      </Row>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>最新音乐</Typography.Title>
      <Row gutter={[24, 24]}>
        {personalizedNewsong?.result?.map(({ id, name, picUrl }) => (
          <Col span={6} key={id}>
            <Card hoverable cover={<img alt={name} src={picUrl} />} bordered={false}>
              <Card.Meta title={name} />
            </Card>
          </Col>
        ))}
      </Row>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>推荐电台</Typography.Title>
      <Row gutter={[24, 24]}>
        {programRecommend?.programs?.map(({ id, name, coverUrl }) => (
          <Col span={6} key={id}>
            <Card hoverable cover={<img alt={name} src={coverUrl} />} bordered={false}>
              <Card.Meta title={name} />
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}

export default Home;
