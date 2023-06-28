import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
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

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const { pid } = useParams();
  const theme = useTheme();
  const { addPlayQueue } = usePlay();
  const titleNodeRef = useRef<HTMLDivElement>();
  const [openSimpleTitle, setOpenSimpleTitle] = useState(false);
  // 设置播放队列
  const {
    isCollect, isCreated, collect, cancelCollect,
  } = useUserPlaylist();
  const [songList, setSongList] = useState<Song[]>([]);

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
  const { loading: fetchingPlaylistTrack } = useRequest(() => getPlaylistTrackAll({
    id: Number(pid),
    limit: 9999,
    offset: 0,
  }), {
    refreshDeps: [pid],
    onSuccess: (data) => {
      if (Array.isArray(data?.songs)) {
        setSongList([...data.songs]);
      }
    },
  });

  const updatePlayList = () => {
    window.setTimeout(() => {
      // 更新歌单歌曲顺序
      postSongOrderUpdate({
        pid: Number(pid),
        ids: songList.map(({ id }) => id!),
      });
    }, 200);
  };

  const handlePlayAll = () => addPlayQueue(songList);

  const handleCollect = () => (isCollect(pid) ? cancelCollect(pid) : isCollect(pid));

  return (
    <PageContainer
      // speedActions={[
      //   {
      //     name: '下载',
      //     icon: <MdCloudDownload size={24} />,
      //     onClick: () => download(songList),
      //   },
      //   {
      //     name: isCollect(pid) ? '取消收藏' : '收藏',
      //     icon: isCollect(pid) ? <MdStar size={24} /> : <MdStarOutline size={24} />,
      //     onClick: handleCollect,
      //   },
      //   {
      //     name: '播放',
      //     icon: <MdPlayCircle size={24} color={theme.palette.primary.main} />,
      //     onClick: handlePlayAll,
      //   },
      // ]}
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
          <Box ref={titleNodeRef} sx={{ padding: '16px', display: 'flex', columnGap: 2 }}>
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
                <MultilineOverflowText
                  variant="body2"
                  lines={2}
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  {playListDetailRes?.playlist?.description}
                </MultilineOverflowText>
                {playListDetailRes?.playlist?.trackCount && (
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  sx={{ '&:hover': { backgroundColor: '#00bcd4' } }}
                  variant="contained"
                  startIcon={<MdPlayArrow />}
                  onClick={handlePlayAll}
                >
                  播放
                </Button>
                {/* <Stack direction="row" spacing={2}>
                  <Button
                    sx={{ '&:hover': { backgroundColor: '#00bcd4' } }}
                    variant="contained"
                    startIcon={<MdPlayCircle />}
                    onClick={handlePlayAll}
                  >
                    播放
                  </Button>
                  {!isCreated(pid) && (
                    <Button
                      variant="outlined"
                      startIcon={isCollect(pid) ? <MdStar /> : <MdStarOutline />}
                      onClick={handleCollect}
                    >
                      {isCollect(pid) ? '取消收藏' : '收藏'}
                    </Button>
                  )}
                </Stack> */}
                <Stack direction="row" spacing={2}>
                  <TooltipButton
                    title={isCollect(pid) ? '取消收藏' : '收藏'}
                    onClick={handleCollect}
                  >
                    {isCollect(pid) ? <MdStar color={theme.palette.primary.main} /> : <MdStarOutline />}
                  </TooltipButton>
                  <TooltipButton
                    title="下载全部"
                    onClick={() => download(songList)}
                  >
                    <MdCloudDownload />
                  </TooltipButton>
                </Stack>

              </Box>
            </Stack>
          </Box>
        )}
        <SongListTable loading={fetchingPlaylistTrack} data={songList} />
      </Box>
    </PageContainer>
  );
};

export default PlayList;
