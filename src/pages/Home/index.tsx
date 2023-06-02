import { useState } from 'react';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageCard from '@/components/image-card';
import ListSubheader from '@mui/material/ListSubheader';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { getRecommendResource, getProgramRecommend, getPersonalizedNewsong } from '@/service';
import styles from './index.module.less';

/**
 * 主页
 */
function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);

  const { data: recommendResource } = useRequest(getRecommendResource);

  const { data: programRecommend } = useRequest(getProgramRecommend);

  const { data: personalizedNewsong } = useRequest(getPersonalizedNewsong);

  return (
    <>
      <Tabs selectedIndex={tab} onSelect={(index) => setTab(index)}>
        <ListSubheader sx={{ background: (theme) => theme.palette.primary.dark }}>
          <TabList className={styles.pageTabList}>
            <Tab>歌单</Tab>
            <Tab>音乐</Tab>
          </TabList>
        </ListSubheader>
        <TabPanel forceRender>
          <ImageList cols={4} gap={24}>
            {recommendResource?.recommend?.map(({ id, name, picUrl }) => (
              <ImageCard
                key={id}
                title={name}
                imgUrl={picUrl}
                onClick={() => navigate(`/playlist/${id}`)}
              />
            )) ?? []}
          </ImageList>
        </TabPanel>
        <TabPanel forceRender>
          <ImageList cols={4} gap={24}>
            {personalizedNewsong?.result?.map(({ id, name, picUrl }) => (
              <ImageCard
                key={id}
                title={name}
                imgUrl={picUrl}
                onClick={() => navigate(`/playlist/${id}`)}
              />
            )) ?? []}
          </ImageList>
        </TabPanel>
      </Tabs>
      {/* <ListSubheader>
        <Typography variant="h5" color={(theme) => theme.palette.primary.dark} sx={{ padding: '8px' }}>
          推荐歌单
        </Typography>
      </ListSubheader>

      <ListSubheader>
        <Typography variant="h5" color={(theme) => theme.palette.primary.dark} sx={{ padding: '8px' }}>
          最新音乐
        </Typography>
      </ListSubheader>

      <ListSubheader>
        <Typography variant="h5" color={(theme) => theme.palette.primary.dark} sx={{ padding: '8px' }}>
          推荐播客
        </Typography>
      </ListSubheader>
      <ImageList cols={4} gap={24}>
        {programRecommend?.programs?.map(({ id, name, coverUrl }) => (
          <ImageCard
            key={id}
            title={name}
            imgUrl={coverUrl}
            onClick={() => navigate(`/playlist/${id}`)}
          />
        )) ?? []}
      </ImageList> */}
    </>
  );
}

export default Home;
