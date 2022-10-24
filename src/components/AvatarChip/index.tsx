import React, { useState } from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import { ReactComponent as User } from '@/assets/icons/user.svg';
import styles from './index.module.less';

interface Props {
  avatar?: string;
  username?: string;
}

/**
 * 头像
 */
const AvatarChip: React.FC<Props> = ({
  avatar,
  username
}) => {
  const [active, setActive] = useState(false);

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          icon: <User />,
          label: <a>个人信息</a>,
        }
      ]}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <div className={styles.avatarChip}>
        <Avatar icon={<User />} className={styles.avatar}/>
        <a className={styles.username}>
          xx测试测试xx测试
        </a>
      </div>
    </Dropdown>
  );
};

export default AvatarChip;
