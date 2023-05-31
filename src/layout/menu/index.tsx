import {
  MdRadio,
  MdHistory,
  MdRecommend,
  MdOutlineWbCloudy,
  MdStars,
} from 'react-icons/md';
import PlaylistMenu from './playlist-menu';
import type { MenuProps } from './types';

const menus: MenuProps[] = [
  {
    label: '推荐',
    icon: <MdRecommend />,
    key: '/',
  },
  {
    label: '私人FM',
    icon: <MdRadio />,
    key: '/fm',
  },
  {
    label: '收藏',
    icon: <MdStars />,
    key: '/collect',
  },
  {
    label: '云盘',
    icon: <MdOutlineWbCloudy />,
    key: '/drive',
  },
  {
    label: '最近播放',
    icon: <MdHistory />,
    key: '/history',
  },
];

export {
  menus,
  PlaylistMenu,
};
