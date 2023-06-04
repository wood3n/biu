import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '@/store/user-atom';
import {
  MdPlaylistAdd,
  MdPlayCircle,
} from 'react-icons/md';
import { useAtomValue } from 'jotai';
import { userPlaylistAtom } from '@/store/user-playlist-atom';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import OverflowText from '@components/overflow-text';
import TooltipButton from '@/components/tooltip-button';
import CreatePlayList from '@components/create-playlist';
import type { PlaylistInfoType } from '@service/user-playlist';
import SimpleBar from 'simplebar-react';
import './index.less';

interface Props {
  selectedKeys: string[];
}

interface PlaylistMenuType extends Omit<PlaylistInfoType, 'name' | 'id'> {
  label: React.ReactNode;
  key: string;
  id?: number;
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
  const globalTheme = useTheme();
  const [user] = useUser();
  const userPlaylist = useAtomValue(userPlaylistAtom);
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoverId] = useState<number | null>(null);

  useEffect(() => {
    const observerTarget = document.querySelectorAll('.MuiListSubheader-root');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('sticky-subheader', entry.intersectionRatio < 1);
      });
    }, {
      threshold: [1],
    });

    if (observerTarget) {
      observerTarget.forEach((tagret) => {
        observer.observe(tagret);
      });
    }
  }, []);

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
        sub: createdList?.map(({
          id, name, coverImgUrl, trackCount,
        }) => ({
          label: name,
          id,
          key: `/playlist/${id}`,
          cover: coverImgUrl,
          trackCount,
        })),
      });
    }

    const collectList = userPlaylist?.filter((item) => item.creator?.userId !== user?.userInfo?.profile?.userId);
    if (collectList?.length) {
      playListMenu.push({
        label: '收藏的歌单',
        key: 'collect',
        sub: collectList?.map(({
          id, name, coverImgUrl, trackCount,
        }) => ({
          label: name,
          id,
          key: `/playlist/${id}`,
          cover: coverImgUrl,
          trackCount,
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
                <ListSubheader
                  sx={{
                    background: '#1E1E1E',
                    top: '-1px',
                  }}
                >
                  {label}
                </ListSubheader>
                {sub.map((child) => (
                  <ListItemButton
                    key={child.key}
                    selected={selectedKeys.includes(child.key)}
                    onClick={() => {
                      navigate(key);
                    }}
                    onMouseEnter={() => setHoverId(child.id as number)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <ListItemAvatar>
                      <Avatar variant="square" src={child.cover} />
                    </ListItemAvatar>
                    <ListItemText
                      disableTypography
                      secondary={(
                        <Typography
                          variant="body2"
                          color={(theme) => theme.palette.text.secondary}
                          paddingTop="4px"
                        >
                          {`${child.trackCount}首歌曲`}
                        </Typography>
                      )}
                      sx={{
                        paddingRight: '50px',
                      }}
                    >
                      <OverflowText title={child.label}>
                        {child.label}
                      </OverflowText>
                    </ListItemText>
                    {hoveredId === child.id && (
                      <ListItemSecondaryAction>
                        <TooltipButton tooltip="播放">
                          <MdPlayCircle color={globalTheme.palette.primary.main} />
                        </TooltipButton>
                      </ListItemSecondaryAction>
                    )}
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
