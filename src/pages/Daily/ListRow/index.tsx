import React, { useState } from 'react';
import {
  Typography, Skeleton, Dropdown, Row, Col,
} from 'antd';
import {
  MdPlayArrow,
  MdSkipNext,
  MdAdd,
  MdFileDownload,
  MdMoreHoriz,
  MdOutlineFavorite,
  MdOutlineFavoriteBorder,
} from 'react-icons/md';
import { Audio as AudioSpinner } from 'react-loader-spinner';
import { useAtomValue } from 'jotai';
import { likelistAtom } from '@/store/likelistAtom';
import { formatDuration } from '@/common/utils';
import { type DailySong } from '@/service/recommend-songs';
import SongDescription from '@components/SongDescription';
import TooltipButton from '@/components/TooltipButton';
import classNames from 'classnames';
import styles from './index.module.less';

interface Props {
  loading: boolean;
  index: number;
  data: DailySong;
}

const ListRow: React.FC<Props> = ({
  loading,
  index,
  data,
}) => {
  const likelist = useAtomValue(likelistAtom);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  return loading ? (
    <div className={styles.skeleton}>
      <Skeleton.Avatar active size={48} shape="square" />
      <Skeleton loading paragraph={{ rows: 1, width: '100%' }} />
    </div>
  ) : (

    <Row
      className={classNames(styles.listRow, {
        [styles.listRowPlaying]: playing,
      })}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      align="middle"
    >
      <Col span={1} className={styles.index}>
        {playing
          ? <AudioSpinner width={18} height={18} />
          : hovered
            ? <TooltipButton tooltip="点击播放"><MdPlayArrow size={24} /></TooltipButton>
            : index + 1}
      </Col>
      <Col span={10}>
        <SongDescription
          picUrl={data?.al?.picUrl}
          name={data?.name}
          ar={data?.ar}
        />
      </Col>
      <Col span={3} className={styles.liked}>
        {data.id && likelist.includes(data.id)
          ? (
            <TooltipButton tooltip="取消喜欢">
              <MdOutlineFavorite size={24} style={{ color: 'red' }} />
            </TooltipButton>
          )
          : hovered && (
            <TooltipButton tooltip="喜欢">
              <MdOutlineFavoriteBorder size={24} />
            </TooltipButton>
          )}
      </Col>
      <Col span={7}>
        <Typography.Text
          ellipsis={{ tooltip: data?.al?.name }}
          className={styles.albumLink}
          style={{ maxWidth: 160 }}
        >
          {data?.al?.name ?? '-'}
        </Typography.Text>
      </Col>
      <Col span={1}>
        {formatDuration(data.dt)}
      </Col>
      <Col span={2} className={styles.more}>
        <MdAdd size={24} />
        <Dropdown
          menu={{
            items: [
              {
                label: '下一首播放',
                key: 'playnext',
                icon: <MdSkipNext size={16} />,
              },
              {
                label: '下载',
                key: 'download',
                icon: <MdFileDownload size={16} />,
              },
            ],
          }}
        >
          <MdMoreHoriz size={24} />
        </Dropdown>
      </Col>
    </Row>
  );
};

export default ListRow;
