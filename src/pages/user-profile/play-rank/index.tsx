import React, { useEffect, useState } from 'react';
// import { useUser } from '@/common/hooks';
import useUser from '@/store/user-atom';
import { getUserRecord } from '@/service';
import type { Song } from '@/service/user-record';
import { useRequest } from 'ahooks';
import { MdAccessTime } from 'react-icons/md';
import { formatDuration } from '@/common/utils';
import SongDescription from '@/components/song-description';
import styles from './index.module.less';

/**
 * 我的听歌排行
 */
const MyPlayRank: React.FC = () => {
  const [user] = useUser();
  const [type, setType] = useState('1');

  const { data, runAsync, loading } = useRequest(getUserRecord, {
    manual: true,
  });

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      runAsync({
        uid: user.userInfo.profile.userId,
        type,
      });
    }
  }, [user?.userInfo?.profile?.userId, type]);

  return (
    <>
      听歌排行
    </>
  );
};

export default MyPlayRank;
