import React, { useState, useEffect } from 'react';
import {
  useLocation,
} from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import {
  MdQueueMusic,
  MdOutlineWbCloudy,
  MdStarBorder,
} from 'react-icons/md';
import BasicMenu from './basic-menu';
import PlaylistMenu from './playlist-menu';

const Menu = () => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [tab, setTab] = React.useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Card sx={{ flex: '0 0 auto', overflowY: 'auto' }}>
        <BasicMenu selectedKeys={selectedKeys} />
      </Card>
      <Card
        sx={{
          flex: '1 0 0',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { display: 'none' },
          }}
        >
          <Tab
            value="1"
            icon={<MdQueueMusic size={20} />}
            iconPosition="start"
            label="歌单"
            sx={{
              flex: 1,
            }}
          />
          <Tab
            value="2"
            icon={<MdStarBorder size={20} />}
            iconPosition="start"
            label="收藏"
            sx={{
              flex: 1,
            }}
          />
          <Tab
            value="3"
            icon={<MdOutlineWbCloudy size={20} />}
            iconPosition="start"
            label="云盘"
            sx={{
              flex: 1,
            }}
          />
        </Tabs>
        <Box sx={{ flex: '1 0 0', overflowY: 'auto' }}>
          <PlaylistMenu selectedKeys={selectedKeys} />
        </Box>
      </Card>
    </Stack>
  );
};

export default Menu;
