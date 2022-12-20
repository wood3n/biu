import React, { useEffect } from 'react';
import {
  Space,
  Avatar,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  Pagination,
  Button,
  Tabs,
  Upload,
  Image
} from 'antd';
import { useRequest } from 'ahooks';
import PageContainer from '@/components/PageContainer';
import { AiOutlineUser } from 'react-icons/ai';
import { MdMale, MdModeEditOutline, MdModeEdit } from 'react-icons/md';
import { useUser } from '@/common/hooks';
import { getUserFollows } from '@/service';
import styles from './index.module.less';

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const { user } = useUser();

  const { data: userFollows, loading, runAsync: reqUserFollows } = useRequest(getUserFollows, { manual: true });

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      Promise.all([
        reqUserFollows({
          uid: user.userInfo.profile.userId,
          limit: 12,
          offset: 0
        })
      ]);
    }
  }, [user?.userInfo?.profile?.userId]);

  return (
    <PageContainer contentStyle={{ margin: 0 }}>
      <div
        style={{
          height: 240,
          backgroundImage: user?.userInfo?.profile?.backgroundUrl ?
            `url(${user.userInfo.profile.backgroundUrl})` :
            'linear-gradient(270deg, rgba(31,223,100,1) 0%, rgba(0,129,207,1) 50%)',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      />
      <div className={styles.userProfile}>
        <div className={styles.userProfileLeft}>
          <Upload>
            <span className={styles.avatar}>
              <Image
                width={220}
                preview={{
                  visible: false,
                  mask: <MdModeEditOutline size={48} />,
                  maskClassName: styles.avatarMask
                }}
                src={user?.userInfo?.profile?.avatarUrl}
                style={{
                  borderRadius: '50%'
                }}
              />
            </span>
          </Upload>
          <Space direction='vertical' className={styles.userInfo}>
            <Space align='center'>
              <Typography.Title level={2} style={{ margin: 0 }}>{user?.userInfo?.profile?.nickname}</Typography.Title>
              <Tag color='#108ee9'>
                Lv {user?.userInfo?.level}
              </Tag>
            </Space>
            <Typography.Paragraph ellipsis={{ rows: 3 }} style={{ width: '60%' }}>
              {user?.userInfo?.profile?.signature}
            </Typography.Paragraph>
          </Space>
        </div>
        <Button className={styles.editBtn}>
          <MdModeEdit />
          修改
        </Button>
      </div>
      <Card bordered={false}>
        <Tabs
          items={[
            {
              label: '关注',
              key: '1',
              children: 'Content of Tab Pane 1',
            },
            {
              label: 'Tab 2',
              key: '2',
              children: 'Content of Tab Pane 2',
            },
            {
              label: 'Tab 3',
              key: '3',
              children: 'Content of Tab Pane 3',
            },
          ]}
        />
        <Typography.Title level={3} style={{ marginBottom: 24 }}>
          我关注的人 ({user?.userInfo?.profile?.follows ?? 0})
        </Typography.Title>
        <Row gutter={[24, 24]}>
          {userFollows?.follow?.map(({ avatarUrl, nickname, userId }) => (
            <Col
              key={userId}
              md={{ span: 6 }}
              lg={{ span: 6 }}
              xl={{ span: 4 }}
              xxl={{ span: 4 }}
            >
              <Card bordered={false} hoverable className={styles.userCard}>
                <Avatar
                  size={120}
                  src={avatarUrl}
                  icon={<AiOutlineUser />}
                />
                <Typography.Title
                  level={5}
                  ellipsis={{ tooltip: nickname }}
                >
                  {nickname}
                </Typography.Title>
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination />
      </Card>
    </PageContainer>
  );
};

export default UserProfile;
