import { useState } from 'react';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageCard from '@/components/image-card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@components/chip';
import Grow from '@mui/material/Grow';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import PageContainer from '@components/page-container';
import { getRecommendResource, getProgramRecommend, getPersonalizedNewsong } from '@/service';

/**
 * 主页
 */
function Home() {
  const navigate = useNavigate();
  const [selectedTab, setTab] = useState('歌单');
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | undefined>();

  const trigger = useScrollTrigger({
    target: scrollTarget,
    threshold: 10,
  });

  const { data: recommendResource } = useRequest(getRecommendResource);

  const { data: programRecommend } = useRequest(getProgramRecommend);

  const { data: personalizedNewsong } = useRequest(getPersonalizedNewsong);

  const data = [
    {
      tab: '歌单',
      list: recommendResource?.recommend?.map(({ id, name, picUrl }) => ({
        key: id,
        title: name,
        imgUrl: picUrl,
      })) ?? [],
    },
    {
      tab: '音乐',
      list: personalizedNewsong?.result?.map(({ id, name, picUrl }) => ({
        key: id,
        title: name,
        imgUrl: picUrl,
      })) ?? [],
    },
  ];

  return (
    <PageContainer scrollableNodeProps={{
      ref: (node: HTMLDivElement) => {
        if (node) {
          setScrollTarget(node as HTMLElement);
        }
      },
    }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          padding: '12px',
          position: 'sticky',
          top: 0,
          boxShadow: trigger ? '0 6px 10px rgba(0,0,0,.6)' : 'none',
          zIndex: 99999,
          background: (theme) => theme.palette.primary.dark,
        }}
      >
        {data.map(({ tab }) => (
          <Chip
            component="a"
            key={tab}
            label={tab}
            clickable
            color="primary"
            variant={selectedTab === tab ? 'filled' : 'outlined'}
            onClick={() => setTab(tab)}
          />
        ))}
      </Stack>
      {data.map(({ tab, list }) => (
        <Grow key={tab} in={tab === selectedTab}>
          <Box
            sx={{ p: '0 12px 12px 12px', display: tab === selectedTab ? 'block' : 'none' }}
          >
            <ImageList cols={4} gap={24}>
              {list.map(({ key, title, imgUrl }) => (
                <ImageCard
                  key={key}
                  title={title}
                  imgUrl={imgUrl}
                  onClick={() => navigate(`/playlist/${key}`)}
                />
              ))}
            </ImageList>
          </Box>
        </Grow>
      )) ?? []}
    </PageContainer>
  );
}

export default Home;
