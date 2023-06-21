import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import SongListTable from '@/components/song-list-table';
import PageContainer from '@/components/page-container';
import PlaylistDescription from '@/components/PlaylistDescription';
import { getPlaylistDetail, getPlaylistTrackAll, postSongOrderUpdate } from '@/service';
import TooltipButton from '@/components/tooltip-button';
import SongDescription from '@/components/song-description';
import TableDurationIcon from '@components/TableDurationIcon';
import Image from '@/components/image';
import { useAtomValue, useSetAtom } from 'jotai';
import { useUserPlaylist } from '@/store/user-playlist-atom';
import { playQueueAtom } from '@/store/play-queue-atom';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext, useSensor, useSensors, MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MdPlayCircle,
  MdSkipNext,
  MdQueueMusic,
  MdShuffle,
  MdAdd,
  MdDownloadForOffline,
  MdOutlineSearch,
  MdFileDownload,
  MdShare,
  MdFavoriteBorder,
  MdStar,
  MdStarOutline,
  MdEditSquare,
} from 'react-icons/md';
import { formatDuration } from '@/common/utils';
import styles from './index.module.less';

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const { pid } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  // 设置播放队列
  const { isCollect, isCreated } = useUserPlaylist();
  const [dataSource, setDataSource] = useState<Song[]>([]);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 600,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor);

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
        setDataSource([...data.songs]);
      }
    },
  });

  const updatePlayList = () => {
    window.setTimeout(() => {
      // 更新歌单歌曲顺序
      postSongOrderUpdate({
        pid: Number(pid),
        ids: dataSource.map(({ id }) => id!),
      });
    }, 200);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((i) => i.id === active.id);
        const overIndex = prev.findIndex((i) => i.id === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
      updatePlayList();
    }
  };

  return (
    <PageContainer>
      <Box sx={{ padding: '12px' }}>
        <Box sx={{ padding: '24px', display: 'flex', columnGap: 2 }}>
          <Image
            src={playListDetailRes?.playlist?.coverImgUrl}
            width={160}
            height={160}
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
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                {playListDetailRes?.playlist?.description}
              </Typography>
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
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<MdPlayCircle />}>播放</Button>
              {!isCreated(pid) && (
                <Button
                  variant="outlined"
                  startIcon={isCollect(pid) ? <MdStar /> : <MdStarOutline />}
                >
                  {isCollect(pid) ? '取消收藏' : '收藏'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
        {/* <TooltipButton title="播放" onClick={() => data && addPlayQueue(data, true)}>
          <MdPlayCircle color="#1fdf64" size={48} />
        </TooltipButton> */}
        <SongListTable loading={fetchingPlaylistTrack} data={dataSource} />
      </Box>
    </PageContainer>
  );
};

export default PlayList;
