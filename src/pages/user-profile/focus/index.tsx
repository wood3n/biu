import React, { useEffect, useState } from 'react';
import { Avatar, Typography, Card } from '@mui/material';
import { AiOutlineUser } from 'react-icons/ai';
// import { useUser } from '@/common/hooks';
import useUser from '@/store/user-atom';
import { useRequest } from 'ahooks';
import { getUserFollows } from '@/service';
import styles from './index.module.less';

/**
 * 我的关注
 */
const MyFocus: React.FC = () => {
  const [user] = useUser();
  const [page, setPage] = useState(1);

  const { data, loading, runAsync } = useRequest(getUserFollows, { manual: true });

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      runAsync({
        uid: user.userInfo.profile.userId,
        limit: 12,
        offset: (page - 1) * 12,
      });
    }
  }, [user?.userInfo?.profile?.userId, page]);

  return (
    <>
      <Typography>我的关注</Typography>
    </>
  );
};

export default MyFocus;
