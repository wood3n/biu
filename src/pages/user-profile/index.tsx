import React from 'react';
import {useDropzone} from 'react-dropzone'
import { Button, Card, Stack, Typography, Avatar } from '@mui/material';
import MultilineOverflowText from '@/components/multiline-overflow-text';
import PageContainer from '@/components/page-container';
import {
  MdModeEditOutline,
  MdModeEdit,
} from 'react-icons/md';
// import { useUser } from '@/common/hooks';
import useUser from '@/store/user-atom';
import MyFocus from './focus';
import MyPlayRank from './play-rank';
import styles from './index.module.less';

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const [user] = useUser();
  const {getRootProps, getInputProps, isDragActive} = useDropzone({})

  return (
    <PageContainer>
      <div
        style={{
          height: 240,
          backgroundImage: user?.userInfo?.profile?.backgroundUrl
            ? `url(${user.userInfo.profile.backgroundUrl})`
            : 'linear-gradient(270deg, rgba(31,223,100,1) 0%, rgba(0,129,207,1) 50%)',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <div className={styles.userProfile}>
        <div className={styles.userProfileLeft}>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Avatar
              alt={user?.userInfo?.profile?.nickname}
              src={user?.userInfo?.profile?.avatarUrl}
              sx={{
                width: 200
              }}
            />
          </div>
          <Stack className={styles.userInfo}>
            <Typography variant='h4'>{user?.userInfo?.profile?.nickname}</Typography>
            <MultilineOverflowText lines={2}>
              {user?.userInfo?.profile?.signature}
            </MultilineOverflowText>
          </Stack>
        </div>
        <Button startIcon={<MdModeEdit />}>
          修改
        </Button>
      </div>
      <Card>
        <MyPlayRank />
      </Card>
      <Card>
        <MyFocus />
      </Card>
    </PageContainer>
  );
};

export default UserProfile;
