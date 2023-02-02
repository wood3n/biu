import {
  MdToday,
  MdRadio,
  MdFavoriteBorder,
  MdHistory,
  MdOutlineAlbum,
  MdRecommend,
  MdOutlineLibraryAdd,
  MdOutlineWbCloudy,
  MdOutlineCollectionsBookmark
} from 'react-icons/md';
import { ItemType } from 'antd/es/menu/hooks/useItems';

export interface MenuItem extends Omit<ItemType, 'children'> {
  label: React.ReactNode;
  icon?: React.ReactNode;
  key: string;
  path?: string;
  id?: number | string;
  children?: MenuItem[];
}

const BASIC_MENU: MenuItem[] = [
  {
    label: '推荐',
    key: 'recommend',
    icon: <MdRecommend />,
    children: [
      {
        label: '每日推荐',
        icon: <MdToday />,
        key: '/',
        path: '/'
      },
      {
        label: '私人 FM',
        icon: <MdOutlineAlbum />,
        key: '/fm',
        path: '/fm'
      },
      {
        label: '电台',
        icon: <MdRadio />,
        key: '/radio',
        path: '/radio'
      },
    ]
  },
  {
    label: '音乐库',
    key: 'lib',
    icon: <MdOutlineLibraryAdd />,
    children: [
      {
        label: '喜欢',
        icon: <MdFavoriteBorder />,
        key: '/favorite',
        path: '/favorite'
      },
      {
        label: '收藏',
        icon: <MdOutlineCollectionsBookmark />,
        key: '/collection',
        path: '/collection',
      },
      {
        label: '云盘',
        icon: <MdOutlineWbCloudy />,
        key: '/cloud',
        path: '/cloud'
      },
      {
        label: '最近播放',
        icon: <MdHistory />,
        key: '/history',
        path: '/history'
      },
    ]
  }
];

export default BASIC_MENU;