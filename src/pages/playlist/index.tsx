import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Breadcrumbs,
  Avatar,
  Chip,
  Stack,
  Link,
  Typography,
  Button,
  Fade,
  useScrollTrigger,
  IconButton,
} from '@mui/material';
import PlaylistTable from '@/components/playlist-table';
import type { ScrollNodeRef } from '@/components/page-container';
import PageContainer from '@/components/page-container';
import { getPlaylistDetail, getPlaylistTrackAll, postSongOrderUpdate } from '@/service';
import TooltipButton from '@/components/tooltip-button';
import Image from '@/components/image';
import MultilineOverflowText from '@/components/multiline-overflow-text';
import usePlay from '@/common/hooks/usePlay';
import { useUserPlaylist } from '@/store/user-playlist-atom';
import {
  MdPlayCircle,
  MdStar,
  MdStarOutline,
  MdEditSquare,
  MdArrowCircleDown,
} from 'react-icons/md';
import { download } from '@/common/utils';
import PlayListSkeleton from './skeleton';

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const navigate = useNavigate();
  const { pid } = useParams();
  const theme = useTheme();
  const { addPlayQueue } = usePlay();
  const containerRef = useRef<ScrollNodeRef>(null);
  // 设置播放队列
  const {
    isCollect, isCreated, collect, cancelCollect,
  } = useUserPlaylist();

  const trigger = useScrollTrigger({
    target: containerRef.current?.getScrollNodeRef().current,
    disableHysteresis: true,
    threshold: 240,
  });

  // 歌单详情
  const { data: playListDetailRes, loading: fetchingPlaylistDetail } = useRequest(() => getPlaylistDetail({
    id: Number(pid),
  }), {
    refreshDeps: [pid],
  });

  // 歌单歌曲详情列表
  const { data: getSongRes, loading: fetchingPlaylistTrack } = useRequest(() => getPlaylistTrackAll({
    id: Number(pid),
    limit: 9999,
    offset: 0,
  }), {
    refreshDeps: [pid],
  });

  const updatePlayList = () => {
    window.setTimeout(() => {
      // 更新歌单歌曲顺序
      postSongOrderUpdate({
        pid: Number(pid),
        ids: getSongRes?.songs?.map(({ id }) => id!),
      });
    }, 200);
  };

  const handlePlayAll = () => addPlayQueue(getSongRes?.songs ?? [], true);

  const handleCollect = () => (isCollect(pid) ? cancelCollect(pid) : collect(pid));

  return (
    <PageContainer
      ref={containerRef}
      titleLeft={(
        <Fade in={trigger}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              columnGap: 2,
            }}
          >
            <Image
              width={32}
              height={32}
              src={playListDetailRes?.playlist?.coverImgUrl}
            />
            <Typography variant="body1">{playListDetailRes?.playlist?.name}</Typography>
            <IconButton size="small" onClick={handlePlayAll}>
              <MdPlayCircle color={theme.palette.primary.main} />
            </IconButton>
            <IconButton size="small" onClick={handleCollect}>
              {isCollect(pid) ? <MdStar color={theme.palette.primary.main} /> : <MdStarOutline />}
            </IconButton>
          </Box>
        </Fade>
      )}
    >
      <Box sx={{ position: 'relative', padding: '8px' }} ref={containerRef}>
        {fetchingPlaylistDetail ? <PlayListSkeleton /> : (
          <Box
            sx={{
              padding: '16px', display: 'flex', columnGap: 2,
            }}
          >
            <Image
              src={playListDetailRes?.playlist?.coverImgUrl}
              width={240}
              height={240}
            />
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack sx={{ flex: 1 }} spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5">{playListDetailRes?.playlist?.name}</Typography>
                  {isCreated(pid) && (
                    <TooltipButton size="small" title="修改歌单信息">
                      <MdEditSquare size={14} color={theme.palette.text.secondary} />
                    </TooltipButton>
                  )}
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    avatar={(
                      <Avatar
                        alt={playListDetailRes?.playlist?.creator?.nickname}
                        src={playListDetailRes?.playlist?.creator?.avatarUrl}
                      />
                    )}
                    label={(
                      <Link
                        underline="hover"
                        onClick={() => navigate(`/profile/${playListDetailRes?.playlist?.creator?.userId}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {playListDetailRes?.playlist?.creator?.nickname}
                      </Link>
                    )}
                    sx={{
                      maxWidth: 'max-content',
                      width: 'auto',
                      background: 'none',
                      '& .MuiChip-avatar': {
                        margin: 0,
                      },
                      '& .MuiChip-label': {
                        fontSize: 'initial',
                      },
                    }}
                  />
                  {Boolean(playListDetailRes?.playlist?.trackCount) && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                      }}
                    >
                      {playListDetailRes?.playlist?.trackCount}
                      {' '}
                      首歌曲
                    </Typography>
                  )}
                </Stack>
                {Boolean(playListDetailRes?.playlist?.tags?.length) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: (theme) => theme.palette.text.secondary,
                      fontSize: (theme) => theme.typography.body2.fontSize,
                    }}
                  >
                    <span>标签：</span>
                    <Breadcrumbs
                      maxItems={5}
                      aria-label="song-tag"
                      sx={{
                        lineHeight: 1,
                      }}
                    >
                      {playListDetailRes?.playlist?.tags?.map((tag) => (
                        <Link
                          key={tag}
                          underline="hover"
                          variant="body2"
                          sx={{ cursor: 'pointer' }}
                        >
                          {tag}
                        </Link>
                      ))}
                    </Breadcrumbs>
                  </Box>
                )}
                <MultilineOverflowText
                  variant="body2"
                  lines={2}
                  sx={{
                    maxWidth: '80%',
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  {playListDetailRes?.playlist?.description}
                </MultilineOverflowText>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'end' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: 2,
                      paddingRight: 2,
                    }}
                  >
                    {Boolean(getSongRes?.songs?.length) && (
                      <Button
                        size="small"
                        onClick={handlePlayAll}
                        variant="outlined"
                        startIcon={<MdPlayCircle />}
                      >
                        播放全部
                      </Button>
                    )}
                    {isCollect(pid) && (
                      <TooltipButton
                        title={isCollect(pid) ? '取消收藏' : '收藏'}
                        onClick={handleCollect}
                      >
                        {isCollect(pid) ? <MdStar color={theme.palette.primary.main} /> : <MdStarOutline />}
                      </TooltipButton>
                    )}
                    {Boolean(getSongRes?.songs?.length) && (
                      <TooltipButton
                        title="下载全部"
                        onClick={() => download(getSongRes?.songs)}
                      >
                        <MdArrowCircleDown color={theme.palette.text.secondary} />
                      </TooltipButton>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </Box>
        )}
        <PlaylistTable loading={fetchingPlaylistTrack} data={getSongRes?.songs} />
      </Box>
    </PageContainer>
  );
};

export default PlayList;
