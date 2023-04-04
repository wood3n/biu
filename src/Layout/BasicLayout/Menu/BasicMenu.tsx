import {
  MdToday,
  MdRadio,
  MdHistory,
  MdRecommend,
  MdOutlineLibraryAdd,
  MdOutlineWbCloudy,
  MdRecentActors,
} from 'react-icons/md';
import { BiLibrary } from 'react-icons/bi';
import { IoRadio } from 'react-icons/io5';

export default [
  {
    label: '推荐',
    icon: <MdRecommend />,
    key: '/',
  },
  {
    label: '日推',
    icon: <MdToday />,
    key: '/daily',
  },
  {
    label: '私人FM',
    icon: <MdRadio />,
    key: '/fm',
  },
  {
    label: '播客',
    icon: <IoRadio />,
    key: '/podcast',
  },
  {
    label: '音乐库',
    key: 'lib',
    type: 'group',
    icon: <MdOutlineLibraryAdd />,
    children: [
      {
        label: '专辑',
        icon: <BiLibrary />,
        key: '/collect/album',
      },
      {
        label: '艺人',
        icon: <MdRecentActors />,
        key: '/collect/artist',
      },
      // {
      //   label: '收藏',
      //   icon: <MdOutlineCollectionsBookmark />,
      //   key: '/collect',
      // },
      {
        label: '云盘',
        icon: <MdOutlineWbCloudy />,
        key: '/cloud',
      },
      {
        label: '最近播放',
        icon: <MdHistory />,
        key: '/history',
      },
    ],
  },
];
