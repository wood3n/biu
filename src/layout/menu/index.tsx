import React, { useState, useEffect } from 'react';
import {
  useLocation,
} from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
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
        <Tabs variant="fullWidth" value={tab} onChange={handleTabChange}>
          <Tab
            value="1"
            icon={(
              <Tooltip title="歌单">
                <MdQueueMusic size={24} />
              </Tooltip>
            )}
          />
          <Tab
            value="2"
            icon={(
              <Tooltip title="收藏">
                <MdStarBorder size={24} />
              </Tooltip>
            )}
          />
          <Tab
            value="3"
            icon={(
              <Tooltip title="云盘">
                <MdOutlineWbCloudy size={24} />
              </Tooltip>
            )}
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
