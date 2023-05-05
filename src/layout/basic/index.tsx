import React from 'react';
import {
  Outlet, Navigate, useLocation,
} from 'react-router-dom';
import {
  getLoginStatus, getUserDetail, getUserSubcount, getLikelist,
} from '@/service';
import { useRequest } from 'ahooks';
import {
  Spin, Layout, theme,
} from 'antd';
import PlayTaskBar from '@components/PlayTaskBar';
import { userAtom } from '@/store/userAtom';
import { likelistAtom } from '@/store/likelistAtom';
import { useSetAtom } from 'jotai';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SimpleBar from 'simplebar-react';
import ElevationScroll from './elevation-scroll';
import Menu from './menu';
import UserAvatarChip from './user-avatar-chip';
import styles from './index.module.less';

const BasicLayout: React.FC = () => {
  const setUser = useSetAtom(userAtom);
  const setLikelist = useSetAtom(likelistAtom);
  const location = useLocation();

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
        setUser({
          userInfo: userDetail,
          userAccountStats,
        });
        setLikelist(ids);
      }
    },
  });

  if (loading) {
    return <div className={styles.pageLoading}><Spin size="large" /></div>;
  }

  if (!data?.data?.profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <ElevationScroll>
        <AppBar>
          <Toolbar />
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Container>
        <Outlet />
      </Container>
    </>
    // <Layout className={styles.basicLayout} style={{ color: colorTextBase }}>
    //   <Layout className={styles.main}>
    //     <Sider
    //       collapsible
    //       trigger={null}
    //       className={styles.sider}
    //       style={{
    //         background: colorBgLayout,
    //       }}
    //     >
    //       <UserAvatarChip />
    //       <div className={styles.siderMenu}>
    //         <SimpleBar style={{ height: '100%' }}><Menu /></SimpleBar>
    //       </div>
    //     </Sider>
    //     <Content className={styles.content} style={{ background: colorBgContainer }}>
    //       <Outlet />
    //     </Content>
    //   </Layout>
    //   <Footer className={styles.footer} style={{ background: colorBgContainer }}>
    //     <PlayTaskBar />
    //   </Footer>
    // </Layout>
  );
};

export default BasicLayout;
