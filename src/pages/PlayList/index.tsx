import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
  Card, Space, Input, Table, Typography, Dropdown, Button,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageContainer from '@/components/PageContainer';
import PlaylistDescription from '@/components/PlaylistDescription';
import { getPlaylistDetail, getPlaylistTrackAll, postSongOrderUpdate } from '@/service';
import type { Song } from '@service/playlist-track-all';
import TooltipButton from '@/components/TooltipButton';
import SongDescription from '@/components/SongDescription';
import { useAtomValue, useSetAtom } from 'jotai';
import { userPlaylistAtom } from '@/store/userPlaylistAtom';
import { playQueueAtom } from '@/store/playQueueAtom';
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
  MdAccessTime,
  MdFileDownload,
  MdShare,
  MdFavoriteBorder,
} from 'react-icons/md';
import { formatDuration } from '@/common/utils';
import styles from './index.module.less';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = (props: RowProps) => {
  const userPlaylist = useAtomValue(userPlaylistAtom);
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            label: '立即播放',
            key: 'play',
            icon: <MdPlayCircle size={14} />,
          },
          {
            label: '下一首播放',
            key: 'playnext',
            icon: <MdSkipNext size={14} />,
          },
          {
            label: '标记为喜欢',
            key: 'like',
            icon: <MdFavoriteBorder size={14} />,
          },
          {
            label: '收藏',
            key: 'collect',
            icon: <MdAdd size={14} />,
            popupClassName: styles.playListMenu,
            // @ts-expect-error children in props
            children: userPlaylist?.map(({ id, name }) => ({
              key: id,
              label: name,
              icon: <MdQueueMusic />,
            })) ?? [],
          },
          {
            label: '下载',
            key: 'download',
            icon: <MdFileDownload size={14} />,
          },
          {
            label: '分享',
            key: 'share',
            icon: <MdShare size={14} />,
            children: [
              {
                label: '微信',
                key: 'wechat',
              },
            ],
          },
        ],
      }}
      trigger={['contextMenu']}
    >
      <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
    </Dropdown>
  );
};

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const { pid } = useParams();
  // 设置播放队列
  const setPlayQueue = useSetAtom(playQueueAtom);
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
    id: pid,
  }), {
    refreshDeps: [pid],
  });

  // 歌单歌曲详情列表
  const { loading: fetchingPlaylistTrack } = useRequest(() => getPlaylistTrackAll({
    id: pid,
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

  const handlePlayAll = () => {
    setPlayQueue(dataSource);
  };

  const columns: ColumnsType<Song> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 10,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '歌曲',
      dataIndex: 'picUrl',
      render: (_, record) => (
        <SongDescription
          picUrl={record?.al?.picUrl}
          name={record?.name}
          ar={record?.ar}
        />
      ),
    },
    {
      title: '专辑',
      width: 320,
      dataIndex: 'al',
      render: (_, record) => (
        <Typography.Text ellipsis={{ tooltip: record?.al?.name }} style={{ maxWidth: 160 }}>
          <Button type="link">{record?.al?.name ?? '-'}</Button>
        </Typography.Text>
      ),
    },
    {
      title: <span className={styles.timeTitle}><MdAccessTime size={18} /></span>,
      width: 88,
      align: 'center',
      dataIndex: 'dt',
      className: styles.dragHidden,
      render: (v) => formatDuration(v),
    },
  ];

  return (
    <PageContainer loading={fetchingPlaylistDetail}>
      <Card bordered={false}>
        <PlaylistDescription
          {...playListDetailRes?.playlist}
        />
        <div className={styles.playlistAction}>
          <Space size={24}>
            <TooltipButton tooltip="播放全部" onClick={handlePlayAll}>
              <MdPlayCircle size={64} color="#1fdf64" />
            </TooltipButton>
            <TooltipButton tooltip="随机播放">
              <MdShuffle size={36} />
            </TooltipButton>
            <TooltipButton tooltip="下载全部">
              <MdDownloadForOffline size={36} />
            </TooltipButton>
          </Space>
          <Input prefix={<MdOutlineSearch />} placeholder="搜索歌曲" style={{ width: 220 }} />
        </div>
        <DndContext onDragEnd={onDragEnd} sensors={sensors}>
          <SortableContext
            items={dataSource.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table<Song>
              loading={fetchingPlaylistTrack}
              columns={columns}
              dataSource={dataSource}
              rowClassName={styles.tableRow}
              rowKey="id"
              components={{
                body: {
                  row: Row,
                },
              }}
              pagination={false}
              onRow={(record) => ({
                // 双击播放
                onDoubleClick: () => {},
              })}
            />
          </SortableContext>
        </DndContext>
      </Card>
    </PageContainer>
  );
};

export default PlayList;
