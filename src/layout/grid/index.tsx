import {
  Outlet, Navigate, useLocation,
} from 'react-router-dom';
import { useRequest } from 'ahooks';
import useUser from '@/store/user-atom';
import { userArsAtom } from '@/store/user-ars-atom';
import { userAlsAtom } from '@/store/user-als-atom';
import { likelistAtom } from '@/store/likelist-atom';
import { useUserPlaylist } from '@/store/user-playlist-atom';
import { useSetAtom } from 'jotai';
import {
  getLoginStatus,
  getUserDetail,
  getUserSubcount,
  getLikelist,
  getArtistSublist,
  getAlbumSublist,
} from '@/service';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CssBaseline from '@mui/material/CssBaseline';
import Card from '@mui/material/Card';
import PlayTaskBar from '@/components/playbar';
import PageLoading from '@components/page-loading';
import Header from '../header';
import Sider from '../sider';

const GridLayout = () => {
  const location = useLocation();
  const [_user, setUser] = useUser();
  const setUserArs = useSetAtom(userArsAtom);
  const setUserAls = useSetAtom(userAlsAtom);
  const setLikelist = useSetAtom(likelistAtom);
  const { refresh } = useUserPlaylist();

  // 获取登录状态
  const { loading, data } = useRequest(getLoginStatus, {
    onSuccess: async ({ data: loginStatus }) => {
      if (loginStatus?.profile?.userId) {
        // 用户详情信息
        const userDetail = await getUserDetail({
          uid: loginStatus.profile.userId,
        });
        // 歌单等数量
        const userAccountStats = await getUserSubcount();
        // 喜欢的歌曲id
        const { ids } = await getLikelist({
          uid: loginStatus.profile.userId,
        });
        // 收藏歌手
        const { data: ars } = await getArtistSublist();
        if (ars) {
          setUserArs(ars);
        }
        // 收藏专辑
        const { data: als } = await getAlbumSublist({
          limit: 99999,
          offset: 0,
        });
        if (als) {
          setUserAls(als);
        }

        // 更新用户歌单列表
        refresh(loginStatus.profile.userId);
        setUser({
          userInfo: userDetail,
          userAccountStats,
        });
        setLikelist(ids);
      }
    },
  });

  if (loading) {
    return (
      <PageLoading />
    );
  }

  if (!data?.data?.profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '8px',
        padding: '8px',
        width: '100vw',
        height: '100vh',
      }}
    >
      <CssBaseline />
      <Box sx={{
        display: 'flex', columnGap: '8px', flex: '1 1 auto', flexWrap: 'nowrap',
      }}
      >
        <Box sx={{ flex: '0 0 20%' }}>
          <Sider />
        </Box>
        {/* minWidth让子元素不会超出flex容器 */}
        <Card
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Card>
      </Box>
      <Card>
        <PlayTaskBar />
      </Card>
    </Box>
  );
};

export default GridLayout;
