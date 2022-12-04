import { MenuItem } from '@/components/Menu';
import {
  MdToday,
  MdRadio,
  MdOutlineCollectionsBookmark,
  MdFavoriteBorder,
  MdHistory,
  MdRssFeed,
  MdOutlineAlbum
} from 'react-icons/md';
import { getPlayList } from '@/service';

const basicMenus = [
  {
    title: '每日推荐',
    icon: <MdToday />,
    key: '/daily',
  },
  {
    title: '私人 FM',
    icon: <MdOutlineAlbum />,
    key: '/fm'
  },
  {
    title: '电台',
    icon: <MdRadio />,
    key: '/fm'
  },
  {
    title: '我喜欢的',
    icon: <MdFavoriteBorder />,
    key: '/favorite'
  },
  {
    title: '我的关注',
    icon: <MdRssFeed />,
    key: '/feed'
  },
  {
    title: '最近播放',
    icon: <MdHistory />,
    key: '/history'
  }
] as MenuItem[];

/**
 * 默认获取30条歌单
 */
const getPlaylists = async (uid: number) => {
  const { playlist } = await getPlayList({
    uid,
    limit: 30,
    offset: 0
  });

  return {
    title: '我的歌单',
    icon: <MdOutlineCollectionsBookmark />,
    key: '/collect',
    children: playlist?.slice(1)?.map(({ id, name }) => ({
      title: name!,
      key: String(id),
    }))
  };
};

const getMenus = async (uid: number) => {
  const playlists = await getPlaylists(uid);
  return basicMenus.concat(playlists);
};

export default getMenus;