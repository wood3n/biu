import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useUser from '@/store/userAtom';
import { getUserPlaylist } from '@/service';
import {
  MdQueueMusic,
  MdPlaylistAdd,
} from 'react-icons/md';
import { useSetAtom, useAtomValue } from 'jotai';
import { userPlaylistAtom } from '@/store/userPlaylistAtom';
import CreatePlayListModal from '@/components/CreatePlayListModal';
import type { MenuProps } from '@/menu';
import basicMenu from '@/menu';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import OverflowText from '@components/overflow-text';

/**
 * 菜单导航
 */
const SysMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useUser();
  const userPlaylist = useAtomValue(userPlaylistAtom);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const menus: MenuProps[] = useMemo(() => {
    const playListMenu = [];
    const createdList = userPlaylist?.filter((item) => item.creator?.userId === user?.userInfo?.profile?.userId);
    if (createdList?.length) {
      playListMenu.push({
        label: (
          <Stack direction="row">
            创建的歌单
            <Tooltip
              title="创建新歌单"
              PopperProps={{
                disablePortal: true,
              }}
            >
              <IconButton
                size="small"
              >
                <MdPlaylistAdd />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
        key: 'created',
        sub: createdList?.map(({ id, name }) => ({
          label: name,
          key: `/playlist/${id}`,
          icon: <MdQueueMusic />,
        })),
      });
    }

    const collectList = userPlaylist?.filter((item) => item.creator?.userId !== user?.userInfo?.profile?.userId);
    if (collectList?.length) {
      playListMenu.push({
        label: '收藏的歌单',
        key: 'collect',
        sub: collectList?.map(({ id, name }) => ({
          label: name,
          key: `/playlist/${id}`,
          icon: <MdQueueMusic />,
        })),
      });
    }

    return [
      ...basicMenu,
      ...playListMenu,
    ];
  }, [userPlaylist]);

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <List
      sx={{
        width: '100%',
        position: 'relative',
        '& ul': { padding: 0 },
      }}
      subheader={<li />}
    >
      {menus.map(({
        label, icon, sub, key,
      }) => (sub ? (
        <li key={key}>
          <ul>
            <ListSubheader>{label}</ListSubheader>
            {sub.map((child) => (
              <ListItemButton
                key={child.key}
                selected={selectedKeys.includes(child.key)}
                onClick={() => {
                  navigate(key);
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                  }}
                >
                  {child.icon}
                </ListItemIcon>
                <ListItemText disableTypography>
                  <OverflowText title={child.label}>
                    {child.label}
                  </OverflowText>
                </ListItemText>
              </ListItemButton>
            ))}
          </ul>
        </li>
      ) : (
        <ListItem key={key} disablePadding>
          <ListItemButton
            selected={selectedKeys.includes(key)}
            onClick={() => {
              navigate(key);
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText disableTypography>
              <OverflowText title={label}>
                {label}
              </OverflowText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      )))}
    </List>
  );
};

export default SysMenu;
