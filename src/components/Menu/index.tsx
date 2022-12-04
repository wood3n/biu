import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import styles from './index.module.less';

export interface MenuItem {
  key?: string;
  path?: string;
  icon?: React.ReactNode;
  title: string;
  children?: MenuItem[];
}

interface MenuItemProps {
  key: string;
  label: string;
  children?: MenuItemProps[];
  icon?: React.ReactNode;
}

interface Props {
  menus: MenuItem[];
}

/**
 * 菜单导航
 */
const SysMenu: React.FC<Props> = ({
  menus
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [defaultOpenKeys, setDefaultOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const items = useMemo(() => {
    const deepMap: (arr: MenuItem[]) => MenuItemProps[] = (arr) => arr.map(({
      key, path, title, icon, children
    }) => {
      if (children) {
        return {
          key: key!,
          icon,
          label: title,
          children: deepMap(children)
        };
      }

      return {
        key: path!,
        label: title,
        path,
        icon
      };
    });

    return deepMap(menus);
  }, [menus]);

  const getAllKeys = () => {
    return menus.map(item => item.key!);
  };

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  useEffect(() => {
    setDefaultOpenKeys(getAllKeys());
  }, [menus]);

  return (
    <Menu
      className={styles.inlineMenu}
      items={items}
      mode='inline'
      openKeys={defaultOpenKeys}
      expandIcon={<>{null}</>}
      selectedKeys={selectedKeys}
      onClick={({ key }) => {
        setSelectedKeys([key]);
        navigate(key);
      }}
    />
  );
};

export default SysMenu;
