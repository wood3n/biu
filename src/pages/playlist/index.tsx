import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import SongListTable from '@/components/song-list-table';
import PageContainer from '@/components/page-container';
import { getPlaylistDetail, getPlaylistTrackAll, postSongOrderUpdate } from '@/service';
import TooltipButton from '@/components/tooltip-button';
import Image from '@/components/image';
import MultilineOverflowText from '@/components/multiline-overflow-text';
import SearchAutoComplete from '@/components/search-autocomplete';
import Empty from '@/components/empty';
import usePlay from '@/common/hooks/usePlay';
import { useUserPlaylist } from '@/store/user-playlist-atom';
import {
  MdPlayCircle,
  MdStar,
  MdStarOutline,
  MdEditSquare,
  MdCloudDownload,
  MdPlayArrow,
} from 'react-icons/md';
import { download } from '@/common/utils';
import PlayListSkeleton from './skeleton';

const StyledChip = styled(Chip)(({ theme }) => ({
  maxWidth: 'auto',
  background: 'none',
  width: 'auto',
}));

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const navigate = useNavigate();
  const { pid } = useParams();
  const theme = useTheme();
  const { addPlayQueue } = usePlay();
  const titleNodeRef = useRef<HTMLDivElement>();
  const [openSimpleTitle, setOpenSimpleTitle] = useState(false);
  // 设置播放队列
  const {
    isCollect, isCreated, collect, cancelCollect,
  } = useUserPlaylist();
  const [searchName, setSearchName] = useState<string>();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio === 0) {
          setOpenSimpleTitle(true);
        } else {
          setOpenSimpleTitle(false);
        }
      });
    }, {
      threshold: [0, 1],
    });

    if (titleNodeRef.current) {
      observer?.observe(titleNodeRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

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

  const handleCollect = () => (isCollect(pid) ? cancelCollect(pid) : isCollect(pid));

  return (
    <PageContainer
      showScrollBoxShadow={false}
    >
      {/* <Box
        sx={{
          position: 'fixed',
          top: '63px',
          padding: '12px',
          zIndex: 9999,
        }}
        className="sticky-subheader"
      >
        <Fade in={openSimpleTitle}>
          <Image
            width={48}
            height={48}
            src={playListDetailRes?.playlist?.coverImgUrl}
          />
        </Fade>
      </Box> */}
      <Box sx={{ padding: '8px' }}>
        {fetchingPlaylistDetail ? <PlayListSkeleton /> : (
          <Box
            ref={titleNodeRef}
            sx={{
              padding: '16px', display: 'flex', columnGap: 2,
            }}
          >
            <Image
              src={playListDetailRes?.playlist?.coverImgUrl}
              width={200}
              height={200}
            />
            <Stack spacing={2}>
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
              </Stack>
            </Stack>
          </Box>
        )}
        {getSongRes?.songs?.length ? (
          <>
            <Box sx={{
              display: 'flex', alignItems: 'center', columnGap: 2,
            }}
            >
              <TooltipButton
                title="播放全部"
                onClick={handlePlayAll}
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  '&:hover': { color: '#00bcd4' },
                }}
              >
                <MdPlayCircle size={48} />
              </TooltipButton>
              {isCollect(pid) && (
                <TooltipButton
                  title={isCollect(pid) ? '取消收藏' : '收藏'}
                  onClick={handleCollect}
                >
                  {isCollect(pid) ? <MdStar color={theme.palette.primary.main} /> : <MdStarOutline />}
                </TooltipButton>
              )}
              <TooltipButton
                title="下载全部"
                onClick={() => download(getSongRes?.songs)}
              >
                <MdCloudDownload color={theme.palette.text.secondary} />
              </TooltipButton>
              <SearchAutoComplete options={getSongRes?.songs?.map((item) => item.name) ?? []} />
            </Box>
            <SongListTable loading={fetchingPlaylistTrack} data={getSongRes?.songs} />
          </>
        ) : <Empty />}
      </Box>
    </PageContainer>
  );
};

export default PlayList;
