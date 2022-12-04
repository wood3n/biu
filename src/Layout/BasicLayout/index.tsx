import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useLogin, useUser } from '@/common/hooks';
import { getLoginStatus, getUserDetail, getUserAcountStats } from '@/service';
import { useRequest } from 'ahooks';
import { Spin, Layout, Avatar } from 'antd';
import { STORAGE_ITEM, update as updateStorage } from '@/localforage';
import Menu, { MenuItem } from '@/components/Menu';
import { AiOutlineUser } from 'react-icons/ai';
import {
  MdArrowLeft,
  MdArrowRight
} from 'react-icons/md';
import getMenus from './menus';
import styles from './index.module.less';

const { Sider, Footer, Content } = Layout;

const BasicLayout: React.FC = () => {
  const { update: updateAccount } = useLogin();
  const { update: updateUser } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const location = useLocation();

  // 获取登录状态
  const { loading, data } = useRequest(getLoginStatus, {
    onSuccess: async ({ data: loginStatus }) => {
      if (loginStatus?.profile && loginStatus.profile.userId) {
        // 用户详情信息
        const userDetail = await getUserDetail(loginStatus.profile.userId);
        // 歌单等数量
        const userAccountStats = await getUserAcountStats();
        // 菜单
        const menus = await getMenus(loginStatus.profile.userId);
        setMenus(menus);
        updateAccount({
          account: loginStatus.account,
          profile: loginStatus.profile
        });

        updateUser({
          userInfo: userDetail,
          userAccountStats
        });
      }
    }
  });

  if (loading) {
    return <div className={styles.pageLoading}><Spin size='large'/></div>;
  }

  if (!data?.data?.profile) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className={styles.basicLayout}>
      <Layout className={styles.main}>
        <Sider
          collapsible
          trigger={null}
          collapsed={collapsed}
          className={styles.sider}
          onCollapse={collapsed => {
            setCollapsed(collapsed);
            updateStorage(STORAGE_ITEM.MENU_COLLAPSED, collapsed);
          }}
        >
          <div className={styles.userAvatarChip}>
            <Avatar icon={<AiOutlineUser />} className={styles.avatar}/>
            {!collapsed && (
              <span className={styles.username}>
                simple musicxxxxxxxxxxxxxxxxxx
              </span>
            )}
          </div>
          <Menu
            menus={menus}
          />
          <div className={styles.menuCollapseTrigger} onClick={handleCollapse}>
            {collapsed ?
              <MdArrowRight size={20} color='#000' /> :
              <MdArrowLeft size={20} color='#000' />
            }
          </div>
        </Sider>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
      <Footer className={styles.sysFooter}>Footer</Footer>
    </Layout>
  );
};

export default BasicLayout;
