import React from 'react';
import {
  Outlet, Navigate, useNavigate, useLocation,
} from 'react-router-dom';
import { useLogin, useUser } from '@/common/hooks';
import { getLoginStatus, getUserDetail, getUserSubcount } from '@/service';
import { useRequest } from 'ahooks';
import {
  Spin, Layout, Avatar, theme,
} from 'antd';
import { AiOutlineUser } from 'react-icons/ai';
import Menu from './Menu';
import styles from './index.module.less';

const { Sider, Footer, Content } = Layout;

const BasicLayout: React.FC = () => {
  const { update: updateAccount } = useLogin();
  const { user, update: updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, colorBgLayout, colorTextBase } } = theme.useToken();

  // 获取登录状态
  const { loading, data } = useRequest(getLoginStatus, {
    onSuccess: async ({ data: loginStatus }) => {
      if (loginStatus?.profile && loginStatus.profile.userId) {
        // 用户详情信息
        const userDetail = await getUserDetail(loginStatus.profile.userId);
        // 歌单等数量
        const userAccountStats = await getUserSubcount();
        updateAccount({
          account: loginStatus.account,
          profile: loginStatus.profile,
        });

        updateUser({
          userInfo: userDetail,
          userAccountStats,
        });
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
    <Layout className={styles.basicLayout} style={{ color: colorTextBase }}>
      <Layout className={styles.main}>
        <Sider
          collapsible
          trigger={null}
          className={styles.sider}
          style={{
            background: colorBgLayout,
          }}
        >
          <div
            className={styles.userAvatarChip}
            onClick={() => navigate('/user')}
          >
            <Avatar
              src={user?.userInfo?.profile?.avatarUrl}
              icon={<AiOutlineUser />}
              className={styles.avatar}
            />
            <span className={styles.username}>
              {user?.userInfo?.profile?.nickname}
            </span>
          </div>
          <Menu />
        </Sider>
        <Content className={styles.content} style={{ background: colorBgContainer }}>
          <Outlet />
        </Content>
      </Layout>
      <Footer className={styles.footer} style={{ background: colorBgContainer }}>Footer</Footer>
    </Layout>
  );
};

export default BasicLayout;
