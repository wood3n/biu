import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '@/store/user-atom';
import {
  MdPlaylistAdd,
} from 'react-icons/md';
import { useAtomValue } from 'jotai';
import { userPlaylistAtom } from '@/store/user-playlist-atom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import OverflowText from '@components/overflow-text';
import TooltipButton from '@/components/tooltip-button';
import CreatePlayList from '@components/create-playlist';
import SimpleBar from 'simplebar-react';

interface Props {
  selectedKeys: string[];
}

interface PlaylistMenuType {
  label: React.ReactNode;
  key: string;
  cover?: string;
  sub?: PlaylistMenuType[];
}

/**
 * 菜单导航
 */
const PlaylistMenu = ({
  selectedKeys,
}: Props) => {
  const navigate = useNavigate();
  const [user] = useUser();
  const userPlaylist = useAtomValue(userPlaylistAtom);
  const [open, setOpen] = React.useState(false);

  const menus: PlaylistMenuType[] = useMemo(() => {
    const playListMenu = [];
    const createdList = userPlaylist?.filter((item) => item.creator?.userId === user?.userInfo?.profile?.userId);
    if (createdList?.length) {
      playListMenu.push({
        label: (
          <div>
            创建的歌单
            <TooltipButton
              tooltip="创建新歌单"
              size="small"
              PopperProps={{
                disablePortal: true,
              }}
              onClick={() => setOpen(true)}
            >
              <MdPlaylistAdd />
            </TooltipButton>
          </div>
        ),
        key: 'created',
        sub: createdList?.map(({ id, name, coverImgUrl }) => ({
          label: name,
          key: `/playlist/${id}`,
          cover: coverImgUrl,
        })),
      });
    }

    const collectList = userPlaylist?.filter((item) => item.creator?.userId !== user?.userInfo?.profile?.userId);
    if (collectList?.length) {
      playListMenu.push({
        label: '收藏的歌单',
        key: 'collect',
        sub: collectList?.map(({ id, name, coverImgUrl }) => ({
          label: name,
          key: `/playlist/${id}`,
          cover: coverImgUrl,
        })),
      });
    }

    return playListMenu;
  }, [userPlaylist, user?.userInfo?.profile?.userId]);

  return (
    <>
      <SimpleBar style={{ height: '100%' }}>
        <List
          sx={{
            width: '100%',
            position: 'relative',
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
        >
          {menus.map(({
            label, cover, sub, key,
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
                    <ListItemAvatar>
                      <Avatar variant="square" src={child.cover} />
                    </ListItemAvatar>
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
                <ListItemAvatar>
                  <Avatar variant="square" src={cover} />
                </ListItemAvatar>
                <ListItemText disableTypography>
                  <OverflowText title={label}>
                    {label}
                  </OverflowText>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          )))}
        </List>
      </SimpleBar>
      <CreatePlayList
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default PlaylistMenu;
