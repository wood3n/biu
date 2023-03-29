import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
  Card, Space, Input, Table, Typography, Dropdown, Button,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageContainer from '@/components/PageContainer';
import SongDescription from '@/components/SongDescription';
import { getPlaylistDetail, getPlaylistTrackAll, postSongOrderUpdate } from '@/service';
import type { PlaylistInfoType } from '@service/user-playlist';
import type { Song } from '@service/playlist-track-all';
import TooltipButton from '@/components/TooltipButton';
import TableSongInfo from '@/components/TableSongInfo';
import { useAtomValue } from 'jotai';
import { playListAtom } from '@/store/play-list-atom';
import type { SortableContainerProps, SortEnd } from 'react-sortable-hoc';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
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

interface SortableItemProps extends React.HTMLAttributes<HTMLTableRowElement> {
  playList?: PlaylistInfoType[];
}

/**
 * SortableItem不能放在组件内部
 * issue：https://github.com/clauderic/react-sortable-hoc/issues/549#issuecomment-532330149
 */
const SortableItem = SortableElement(({ playList, ...props }: SortableItemProps) => (
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
          children: playList?.map(({ id, name }) => ({
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
    <tr {...props} />
  </Dropdown>
));

const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} />
));

/**
 * 歌单歌曲列表
 */
const PlayList: React.FC = () => {
  const { pid } = useParams();
  const playList = useAtomValue(playListAtom);
  const [dataSource, setDataSource] = useState<Song[]>([]);

  // 歌单详情
  const { data: playListDetailRes, loading: fetchingPlaylistDetail } = useRequest(() => getPlaylistDetail({
    id: pid,
  }), {
    refreshDeps: [pid],
  });

  // 歌单歌曲详情列表
  const { refreshAsync, loading: fetchingPlaylistTrack } = useRequest(() => getPlaylistTrackAll({
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

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      // const newData = arrayMoveImmutable(dataSource.slice(), oldIndex, newIndex).filter(
      //   (el: Song) => !!el,
      // );
      // setDataSource(newData);
      // 更新歌单歌曲顺序
      postSongOrderUpdate({
        pid: Number(pid),
        ids: dataSource.map(({ id }) => id!),
      });
      refreshAsync();
    }
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
        <TableSongInfo
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

  const DraggableContainer = (containerProps: SortableContainerProps) => (
    <SortableBody
      pressDelay={600}
      onSortEnd={onSortEnd}
      helperClass={styles.dragingRow}
      {...containerProps}
    />
  );

  const DraggableBodyRow: React.FC<any> = (restProps) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem playList={playList} index={index} {...restProps} />;
  };

  return (
    <PageContainer loading={fetchingPlaylistDetail}>
      <Card bordered={false}>
        <SongDescription
          {...playListDetailRes?.playlist}
        />
        <div className={styles.playlistAction}>
          <Space size={24}>
            <TooltipButton tooltip="播放全部">
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
        <Table<Song>
          loading={fetchingPlaylistTrack}
          columns={columns}
          dataSource={dataSource}
          rowClassName={styles.tableRow}
          rowKey="id"
          components={{
            body: {
              wrapper: DraggableContainer,
              row: DraggableBodyRow,
            },
          }}
          pagination={false}
          onRow={(record) => ({
            // 双击播放
            onDoubleClick: () => {},
          })}
        />
      </Card>
    </PageContainer>
  );
};

export default PlayList;
