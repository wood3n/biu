import React from 'react';
import {
  Outlet, Navigate, useLocation,
} from 'react-router-dom';
import {
  getLoginStatus, getUserDetail, getUserSubcount, getLikelist, getUserPlaylist,
} from '@/service';
import { useRequest } from 'ahooks';
import { userAtom } from '@/store/user-atom';
import { likelistAtom } from '@/store/likelist-atom';
import { useUserPlaylist } from '@/store/user-playlist-atom';
import { useSetAtom } from 'jotai';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import PlayBar from '@/components/playbar';
import SimpleBar from 'simplebar-react';
import Menu from './menu';
import styles from './index.module.less';

const BasicLayout: React.FC = () => {
  const setUser = useSetAtom(userAtom);
  const setLikelist = useSetAtom(likelistAtom);
  const { refresh } = useUserPlaylist();
  const location = useLocation();
  const theme = useTheme();

  // 获取登录状态
  const { loading, data } = useRequest(getLoginStatus, {
    onSuccess: async ({ data: loginStatus }) => {
      if (loginStatus?.profile?.userId) {
        // 用户详情信息
        const userDetail = await getUserDetail({
          uid: loginStatus.profile.userId,
        });
        // 歌单等数量
        const userAccountStats = await getUserSubcount();
        // 喜欢的歌曲id
        const { ids } = await getLikelist({
          uid: loginStatus.profile.userId,
        });

        // 更新用户歌单列表
        refresh(loginStatus.profile.userId);
        setUser({
          userInfo: userDetail,
          userAccountStats,
        });
        setLikelist(ids);
      }
    },
  });

  if (loading) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!data?.data?.profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className={styles.basicLayout}>
      <AppBar
        position="fixed"
        sx={{
          height: 64,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            height: 64,
          }}
        >
          <Typography variant="h6" noWrap component="div">
            Clipped drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={styles.sider}>
        <SimpleBar style={{ height: '100%', overflow: 'auto' }}>
          <Menu />
        </SimpleBar>
      </div>
      <div className={styles.outlet}>
        <SimpleBar style={{ height: '100%' }}>
          <Outlet />
        </SimpleBar>
      </div>
      <AppBar
        component="div"
        position="fixed"
        sx={{
          top: 'auto',
          bottom: 0,
          height: '80px',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <PlayBar />
      </AppBar>
    </div>
  );
};

export default BasicLayout;
