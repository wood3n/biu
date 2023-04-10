import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu as AntMenu, theme, Tooltip,
} from 'antd';
import useUser from '@/store/userAtom';
import type { MenuProps } from 'antd/es/menu';
import { getUserPlaylist } from '@/service';
import {
  MdQueueMusic,
  MdPlaylistAdd,
} from 'react-icons/md';
import { useSetAtom } from 'jotai';
import { userPlaylistAtom } from '@/store/userPlaylistAtom';
import CreatePlayListModal from '@/components/CreatePlayListModal';
import BasicMenu from './BasicMenu';
import styles from './index.module.less';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * 菜单导航
 */
const SysMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useUser();
  const setPlayList = useSetAtom(userPlaylistAtom);
  const { token: { colorBgLayout } } = theme.useToken();
  const [items, setItems] = useState<MenuItem[]>();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const getPlaylists = async () => {
    // 获取所有歌单
    const { playlist } = await getUserPlaylist({
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      uid: user?.userInfo?.profile?.userId!,
      limit: 1000,
      offset: 0,
    });

    // 更新用户歌单列表
    setPlayList(playlist);
    const playListMenu: MenuItem[] = [];
    const createdList = playlist?.filter((item) => item.creator?.userId === user?.userInfo?.profile?.userId);
    if (createdList?.length) {
      playListMenu.push({
        label: (
          <span className={styles.createdListMenuTitle}>
            创建的歌单
            <Tooltip title="创建新歌单">
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <MdPlaylistAdd size={18} style={{ verticalAlign: '-0.25em' }} />
              </a>
            </Tooltip>
          </span>
        ),
        key: 'created',
        type: 'group',
        children: createdList?.map(({ id, name }) => ({
          label: name,
          key: `/playlist/${id}`,
          icon: <MdQueueMusic />,
        })),
      });
    }

    const collectList = playlist?.filter((item) => item.creator?.userId !== user?.userInfo?.profile?.userId);
    if (collectList?.length) {
      playListMenu.push({
        label: '收藏的歌单',
        key: 'collect',
        type: 'group',
        children: collectList?.map(({ id, name }) => ({
          label: name,
          key: `/playlist/${id}`,
          icon: <MdQueueMusic />,
        })),
      });
    }

    return [
      ...BasicMenu,
      ...playListMenu,
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
    <>
      <AntMenu
        items={items}
        mode="inline"
        inlineIndent={12}
        openKeys={['recommend', 'lib', 'created', 'collect']}
        expandIcon={() => null}
        selectedKeys={selectedKeys}
        onSelect={({ key }) => {
          navigate(key);
        }}
        style={{
          background: colorBgLayout,
          borderInline: 'none',
        }}
      />
      <CreatePlayListModal
        open={open}
        onClose={() => setOpen(false)}
        refreshMenu={updateMenus}
      />
    </>
  );
};

export default SysMenu;
