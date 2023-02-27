import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as AntMenu, theme } from 'antd';
import { useUser } from '@/common/hooks';
import type { MenuProps } from 'antd/es/menu';
import { getPlayList } from '@/service';
import {
  MdLibraryMusic,
  MdToday,
  MdRadio,
  MdFavoriteBorder,
  MdHistory,
  MdOutlineAlbum,
  MdRecommend,
  MdOutlineLibraryAdd,
  MdOutlineWbCloudy,
  MdOutlineCollectionsBookmark
} from 'react-icons/md';
import ScrollArea from 'react-scrollbar';
import CreatePlayListModal from '@/components/CreatePlayListModal';
import CreatedListMenuTitle from './MenuTitle';
import styles from './index.module.less';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * 菜单导航
 */
const SysMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { token: { colorBgLayout } } = theme.useToken();
  const [items, setItems] = useState<MenuItem[]>();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const getPlaylists = async () => {
    // 获取所有歌单
    const { playlist } = await getPlayList({
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      uid: user?.userInfo?.profile?.userId!,
      limit: 1000,
      offset: 0
    });

    const playListMenu: MenuItem[] = [];
    const createdList = playlist?.filter(item => item.creator?.userId === user?.userInfo?.profile?.userId)?.slice(1);
    if (createdList?.length) {
      playListMenu.push({
        label: <CreatedListMenuTitle addPlayList={() => setOpen(true)} className={styles.createdListMenuTitle} />,
        icon: <MdLibraryMusic />,
        key: 'created',
        children: createdList?.map(({ id, name }) => ({
          label: name!,
          key: String(id),
        }))
      });
    }

    const collectList = playlist?.filter(item => item.creator?.userId !== user?.userInfo?.profile?.userId);
    if (collectList?.length) {
      playListMenu.push({
        label: '收藏的歌单',
        icon: <MdLibraryMusic />,
        key: 'collect',
        children: collectList?.map(({ id, name }) => ({
          label: name!,
          key: String(id),
        }))
      });
    }

    return [
      {
        label: '推荐',
        key: 'recommend',
        icon: <MdRecommend />,
        children: [
          {
            label: '每日推荐',
            icon: <MdToday />,
            key: '/daily'
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
            label: '喜欢',
            icon: <MdFavoriteBorder />,
            key: '/favorite'
          },
          {
            label: '收藏',
            icon: <MdOutlineCollectionsBookmark />,
            key: '/collection'
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
      },
      ...playListMenu
    ] as MenuItem[];
  };

  const updateMenus = async () => {
    const playlists = await getPlaylists();
    setItems(playlists);
  };

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      updateMenus();
    }
  }, [user?.userInfo?.profile?.userId]);

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <ScrollArea>
      <AntMenu
        items={items}
        mode='inline'
        inlineIndent={12}
        openKeys={['recommend', 'lib', 'created', 'collect']}
        expandIcon={() => null}
        selectedKeys={selectedKeys}
        onClick={({ key }) => {
          setSelectedKeys([key]);
          if (key.startsWith('/')) {
            navigate(key);
          } else {
            navigate(`/playlist/${key}`);
          }
        }}
        style={{
          background: colorBgLayout
        }}
      />
      <CreatePlayListModal
        open={open}
        onClose={() => setOpen(false)}
        refreshMenu={updateMenus}
      />
    </ScrollArea>
  );
};

export default SysMenu;
