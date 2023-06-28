import { useState } from 'react';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageCard from '@/components/image-card';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import {
  MdToday,
  MdLibraryMusic,
  MdQueueMusic,
} from 'react-icons/md';
import PageContainer from '@components/page-container';
import ScrollObserverTarget from '@/components/scroll-observer-target';
import {
  getRecommendSongs,
  getRecommendResource,
  getProgramRecommend,
  getPersonalizedNewsong,
} from '@/service';
import { MUSIC_FEE } from '@/common/constants';
import useUser from '@/store/user-atom';
import Daily from './daily';

/**
 * 主页
 */
function Home() {
  const theme = useTheme();
  const [user] = useUser();
  const navigate = useNavigate();
  const [selectedTab, setTab] = useState('日推');

  const { data: recommendDailySongs, loading } = useRequest(getRecommendSongs);

  const { data: recommendResource } = useRequest(getRecommendResource);

  const { data: programRecommend } = useRequest(getProgramRecommend);

  const { data: personalizedNewsong } = useRequest(getPersonalizedNewsong);

  const data = [
    {
      tab: '日推',
      icon: <MdToday size={18} />,
      component: (
        <Daily
          loading={loading}
          data={recommendDailySongs?.data?.dailySongs?.filter(({ fee }) => fee === MUSIC_FEE.FREE || fee === MUSIC_FEE.FREE_EX
           || (user?.userInfo?.profile?.vipType && fee === MUSIC_FEE.VIP))}
        />
      ),
    },
    {
      tab: '歌单',
      icon: <MdLibraryMusic size={18} />,
      imgList: recommendResource?.recommend?.map(({ id, name, picUrl }) => ({
        key: id,
        title: name,
        imgUrl: picUrl,
      })) ?? [],
    },
    {
      tab: '音乐',
      icon: <MdQueueMusic size={18} />,
      imgList: personalizedNewsong?.result?.map(({ id, name, picUrl }) => ({
        key: id,
        title: name,
        imgUrl: picUrl,
      })) ?? [],
    },
  ];

  return (
    <PageContainer
      left={(
        <Tabs
          value={selectedTab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{
            style: { display: 'none' },
          }}
        >
          {data.map(({ tab, icon }) => (
            <Tab
              key={tab}
              icon={icon}
              iconPosition="start"
              value={tab}
              label={tab}
              sx={{
                minHeight: '42px',
              }}
            />
          ))}
        </Tabs>
      )}
    >
      {data.map(({ tab, imgList, component }) => (
        <Grow key={tab} in={tab === selectedTab}>
          <Box
            sx={{ display: tab === selectedTab ? 'block' : 'none' }}
          >
            {imgList ? (
              <ImageList sx={{ p: '0 12px 12px 12px' }} cols={4} gap={12}>
                {imgList.map(({ key, title, imgUrl }) => (
                  <ImageCard
                    key={key}
                    title={title}
                    imgUrl={imgUrl}
                    onClick={() => navigate(`/playlist/${key}`)}
                  />
                ))}
              </ImageList>
            ) : component}
          </Box>
        </Grow>
      )) ?? []}
    </PageContainer>
  );
}

export default Home;
