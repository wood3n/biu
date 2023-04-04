import {
  Avatar, Typography, Dropdown, Modal,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { MdArrowRight, MdOutlineLogout } from 'react-icons/md';
import { RiProfileLine } from 'react-icons/ri';
import useUser from '@/store/userAtom';
import { getLogout } from '@/service';
import styles from './index.module.less';

const UserAvatarChip = () => {
  const [user] = useUser();
  const navigate = useNavigate();

  const logout = async () => {
    getLogout().then(() => {
      navigate('/login');
    });
  };

  return (
    <div
      className={styles.userAvatarChip}
      onClick={() => navigate('/profile')}
    >
      <Avatar
        src={user?.userInfo?.profile?.avatarUrl}
        className={styles.avatar}
      />
      <Dropdown
        menu={{
          onClick: ({ key }) => {
            if (key === '/profile') {
              navigate('/profile');
            }

            if (key === 'logout') {
              Modal.confirm({
                title: '退出登录？',
                onOk: logout,
              });
            }
          },
          items: [
            {
              label: '个人主页',
              key: '/profile',
              icon: <RiProfileLine size={16} />,
            },
            {
              type: 'divider',
            },
            {
              label: '退出登录',
              key: 'logout',
              icon: <MdOutlineLogout size={16} />,
            },
          ],
        }}
      >
        <span className={styles.username}>
          <Typography.Text ellipsis>
            {user?.userInfo?.profile?.nickname}
          </Typography.Text>
          <MdArrowRight size={24} />
        </span>
      </Dropdown>
    </div>
  );
};

export default UserAvatarChip;
