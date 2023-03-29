import React, { useState } from 'react';
import { Table, Typography, Dropdown } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import TableSongInfo from '@/components/TableSongInfo';
import { MdAccessTime } from 'react-icons/md';
import { formatDuration } from '@/common/utils';
import type { Song } from '@service/playlist-track-all';
import { arrayMoveImmutable } from 'array-move';
import type { SortableContainerProps, SortEnd } from 'react-sortable-hoc';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import styles from './index.module.less';

const SortableItem = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props} />
));

const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} />
));

/**
 * 通用音乐播放列表
 * 支持行拖拽排序、右键行菜单、双击行播放、点击行选中
 */
const MusicTableList = (props: TableProps<Song>) => {
  // 当前 hover 行
  const [hoverRowIndex, setHoverRowIndex] = useState<number>();
  // 数据
  const [dataSource, setDataSource] = useState<Song[]>([]);

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(dataSource.slice(), oldIndex, newIndex).filter(
        (el: Song) => !!el,
      );
      setDataSource(newData);
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
      render: (_, record, i) => (
        <TableSongInfo
          picUrl={record?.al?.picUrl}
          name={record?.name}
          ar={record?.ar}
          hovering={hoverRowIndex === i}
        />
      ),
    },
    {
      title: '专辑',
      width: 320,
      dataIndex: 'al',
      render: (_, record) => (
        <Typography.Text ellipsis={{ tooltip: record?.al?.name }} style={{ maxWidth: 160 }}>
          <a className={styles.tableLink}>{record?.al?.name ?? '-'}</a>
        </Typography.Text>
      ),
    },
    {
      title: <span className={styles.timeTitle}><MdAccessTime size={18} /></span>,
      width: 88,
      align: 'center',
      dataIndex: 'dt',
      render: (v) => formatDuration(v),
    },
  ];

  const DraggableContainer = (containerProps: SortableContainerProps) => (
    <SortableBody
      onSortEnd={onSortEnd}
      {...containerProps}
    />
  );

  const DraggableBodyRow: React.FC<any> = ({ className, style, ...restProps }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <Table<Song>
      columns={columns}
      rowClassName={styles.tableRow}
      rowKey="id"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
      onRow={(record, i) => ({
        onClick: (event) => {}, // 点击行
        onDoubleClick: (event) => {},
        onContextMenu: (event) => {},
        onMouseEnter: (event) => {
          setHoverRowIndex(i);
        }, // 鼠标移入行
        onMouseLeave: (event) => {},
      })}
      {...props}
    />
  );
};

export default MusicTableList;
