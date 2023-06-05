import React, {
  useState, useEffect, useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '@/store/user-atom';
import {
  MdPlaylistAdd,
} from 'react-icons/md';
import { useAtomValue } from 'jotai';
import { userPlaylistAtom } from '@/store/user-playlist-atom';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import TooltipButton from '@/components/tooltip-button';
import CreatePlayList from '@components/create-playlist';
import type { PlaylistInfoType } from '@service/user-playlist';
import SimpleBar from 'simplebar-react';
import ListItem from './list-item';
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
  const [user] = useUser();
  const userPlaylist = useAtomValue(userPlaylistAtom);
  const [open, setOpen] = useState(false);
  const observerTargets = document.querySelectorAll('.MuiListSubheader-root');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('sticky-subheader', entry.intersectionRatio < 1);
    });
  }, {
    threshold: [0, 1],
  });

  if (observerTargets.length) {
    observerTargets.forEach((target) => {
      observer?.observe(target);
    });
  }

  useEffect(() => () => {
    observer?.disconnect();
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
              title="创建新歌单"
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
            label, sub, key,
          }) => ((
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
                {sub?.map((child) => (
                  <ListItem
                    key={child.key}
                    selected={selectedKeys.includes(child.key)}
                    imgUrl={child.cover}
                    title={child.label}
                    trackCount={child.trackCount}
                    onClick={() => navigate(child.key)}
                  />
                ))}
              </ul>
            </li>
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
