import React, { useEffect } from 'react';
import {
  Space,
  Avatar,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Upload,
  Image
} from 'antd';
import { useRequest } from 'ahooks';
import PageContainer from '@/components/PageContainer';
import { AiOutlineUser } from 'react-icons/ai';
import {
  MdMale,
  MdModeEditOutline,
  MdModeEdit,
  MdAccountCircle
} from 'react-icons/md';
import { useUser } from '@/common/hooks';
import MyFocus from './Focus';
import MyPlayRank from './PlayRank';
import styles from './index.module.less';

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const { user } = useUser();

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
            <Typography.Title level={2} style={{ margin: 0 }}>{user?.userInfo?.profile?.nickname}</Typography.Title>
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
        <MyPlayRank />
      </Card>
      <Card bordered={false}>
        <MyFocus />
      </Card>
    </PageContainer>
  );
};

export default UserProfile;
