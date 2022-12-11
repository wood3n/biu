import React from 'react';
import { Space, Avatar, Typography, Tag } from 'antd';
import PageContainer from '@/components/PageContainer';
import { AiOutlineUser } from 'react-icons/ai';
import { MdMale, MdFemale } from 'react-icons/md';
import { useUser } from '@/common/hooks';
import styles from './index.module.less';

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const { user } = useUser();

  return (
    <PageContainer>
      <div className={styles.pageHeader}>
        <Space size={24}>
          <Avatar
            size={{ xs: 150, sm: 150, md: 150, lg: 180, xl: 180, xxl: 200 }}
            src={user?.userInfo?.profile?.avatarUrl}
            icon={<AiOutlineUser />}
          />
          <Space direction='vertical'>
            <Typography.Title level={2}>{user?.userInfo?.profile?.nickname}</Typography.Title>
            <Typography.Title level={5} className={styles.genderAndLv}>
              {user?.userInfo?.profile?.gender === 1 ? <MdMale size={24}/> : <MdFemale size={24}/>}
              <Tag color='#108ee9'>
                Lv {user?.userInfo?.level}
              </Tag>
            </Typography.Title>
            <span>累计听歌：{user?.userInfo?.listenSongs} 首</span>
          </Space>
        </Space>
      </div>
    </PageContainer>
  );
};

export default UserProfile;
