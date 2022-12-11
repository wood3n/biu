import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as AntMenu, theme } from 'antd';
import { useUser } from '@/common/hooks';
import type { MenuProps } from 'antd/es/menu';
import { getPlayList } from '@/service';
import {
  MdToday,
  MdRadio,
  MdLibraryMusic,
  MdFavoriteBorder,
  MdHistory,
  MdOutlineAlbum,
  MdRecommend,
  MdOutlineLibraryAdd,
  MdOutlineWbCloudy,
  MdOutlineCollectionsBookmark
} from 'react-icons/md';

type MenuItem = Required<MenuProps>['items'][number];

const getPlaylists = async (uid: number) => {
  const { playlist } = await getPlayList({
    uid,
    limit: 30,
    offset: 0
  });

  const basicMenus: MenuItem[] = [
    {
      label: '推荐',
      key: 'recommend',
      icon: <MdRecommend />,
      children: [
        {
          label: '每日推荐',
          icon: <MdToday />,
          key: '/',
        },
        {
          label: '私人 FM',
          icon: <MdOutlineAlbum />,
          key: '/fm'
        },
        {
          label: '电台',
          icon: <MdRadio />,
          key: '/radio'
        },
      ]
    },
    {
      label: '音乐库',
      key: 'lib',
      icon: <MdOutlineLibraryAdd />,
      children: [
        {
          label: '收藏',
          icon: <MdOutlineCollectionsBookmark />,
          key: '/collection',
        },
        {
          label: '云盘',
          icon: <MdOutlineWbCloudy />,
          key: '/cloud'
        },
        {
          label: '最近播放',
          icon: <MdHistory />,
          key: '/history'
        },
      ]
    }
  ];

  console.log(playlist);
  return basicMenus.concat({
    label: '我的歌单',
    icon: <MdLibraryMusic />,
    key: 'collect',
    children: playlist?.map(({ id, name }, index) => ({
      icon: index === 0 ? <MdFavoriteBorder /> : null,
      label: name!,
      key: String(id),
    }))
  }) ;
};

/**
 * 菜单导航
 */
const SysMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [items, setItems] = useState<MenuItem[]>();
  const [openKeys, setOpenKeys] = useState<string[]>(['recommend', 'lib', 'collect']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { token: { colorBgLayout } } = theme.useToken();

  const updateMenus = async (uid: number) => {
    const playlists = await getPlaylists(uid);
    setItems(playlists);
  };

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      updateMenus(user.userInfo.profile.userId);
    }
  }, [user?.userInfo?.profile?.userId]);

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <AntMenu
      items={items}
      mode='inline'
      inlineIndent={12}
      openKeys={openKeys}
      // expandIcon={() => null}
      selectedKeys={selectedKeys}
      onClick={({ key }) => {
        setSelectedKeys([key]);
        navigate(key);
      }}
      onOpenChange={keys => setOpenKeys(keys)}
      style={{
        height: '100%',
        overflowY: 'auto',
        background: colorBgLayout
      }}
    />
  );
};

export default SysMenu;
