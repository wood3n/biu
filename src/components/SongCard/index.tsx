import React from 'react';
import { Avatar, Typography, Card, Dropdown, Tooltip, Menu } from 'antd';
import { ReactComponent as IconPlay } from '@/assets/icons/play.svg';
import { ReactComponent as IconCollect } from '@/assets/icons/collect.svg';
import { ReactComponent as IconLikeOutline } from '@/assets/icons/like_outline.svg';
import { ReactComponent as IconMore } from '@/assets/icons/more.svg';
import './index.less';

interface Props {
  id?: string | number;
  pic?: string;
  canPlay?: boolean;
  imgWidth?: string | number;
  imgHeight?: string | number;
  name?: string;
  arts?: API.Artist[];
  onClick?: () => void;
}

/**
 * 歌曲展示卡片
 */
const SongCard: React.FC<Props> = ({
  pic,
  canPlay,
  imgWidth = '100%',
  imgHeight = '100%',
  name,
  arts
}) => {
  return (
    <Card bordered={false}>
      <div className='image-container'>
        <img
          width={imgWidth}
          height={imgHeight}
          src={pic}
        />
        {canPlay && (
          <div className='song-play-btn'>
            <a><IconPlay /></a>
          </div>
        )}
      </div>
      <Typography.Title level={5} ellipsis={{ tooltip: name }} style={{ maxWidth: '100%', marginBottom: 12 }}>{name}</Typography.Title>
      <div className='card-meta'>
        {arts?.length && (
          <Avatar.Group maxCount={4} size='small'>
            {arts?.map(({ name, id, picUrl }) => (
              <Tooltip key={id} title={name}>
                <Avatar src={picUrl} />
              </Tooltip>
            ))}
          </Avatar.Group>
        )}
        <div className='song-action-container'>
          <Tooltip title='收藏'>
            <a className='song-action'><IconCollect fill='#fff' width={24} height={24} /></a>
          </Tooltip>
          <Tooltip title='喜欢'>
            <a className='song-action'><IconLikeOutline fill='#fff' width={24} height={24}/></a>
          </Tooltip>
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item>菜单项一</Menu.Item>
                <Menu.Item>菜单项二</Menu.Item>
              </Menu>
            )}
          >
            <a className='song-action'><IconMore fill='#fff' width={24} height={24}/></a>
          </Dropdown>
        </div>
      </div>
    </Card>
  );
};

export default SongCard;
