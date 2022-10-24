import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/common/hooks/useAuth';
import { getLoginStatus } from '@/service/api';
import { useRequest } from 'ahooks';
import { Spin, Layout } from 'antd';
import Menu from '@/components/Menu';
import WindowAction from '@/components/WindowAction';
import menus from '@/menus';
import styles from './index.module.less';

const { Sider } = Layout;

const BasicLayout: React.FC = () => {
  const { update } = useAuth();
  const location = useLocation();

  const { loading, data } = useRequest(getLoginStatus, {
    onSuccess: ({ data: loginStatus }) => {
      if (loginStatus?.profile) {
        update({
          account: loginStatus.account,
          profile: loginStatus.profile
        });
      }
    }
  });

  if (loading) {
    return <Spin />;
  }

  if (!data?.data?.profile) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return (
    <Layout className={styles.basicLayout}>
      <Layout>
        <Sider collapsed={false} className={styles.sider}>
          <div className={styles.siderHeader}>
            <WindowAction />
          </div>
          <Menu
            menus={menus}
          />
        </Sider>
        <Layout>
          <Outlet />
        </Layout>
      </Layout>
      <div className={styles.sysFooter}>Footer</div>
    </Layout>
  );
};

export default BasicLayout;
