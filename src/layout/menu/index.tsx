import { useState, useEffect } from 'react';
import {
  useLocation,
} from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  MdLibraryMusic,
  MdStarBorder,
} from 'react-icons/md';
import UserCard from './user-card';
import PlaylistMenu from './playlist-menu';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  '& .MuiToggleButtonGroup-grouped.Mui-selected': {
    'background-color': 'transparent',
  },
}));

const Menu = () => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [tab, setTab] = useState('1');

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <Stack spacing={1} sx={{ height: '100%' }}>
      <Card sx={{ flex: '0 0 auto' }}>
        <UserCard />
      </Card>
      <Card
        sx={{
          flex: '1 0 0',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <StyledToggleButtonGroup
          color="primary"
          size="small"
          value={tab}
          exclusive
          onChange={(_, key) => {
            if (key !== null) {
              setTab(key);
            }
          }}
          sx={{
            borderRadius: 0,
          }}
        >
          <ToggleButton value="1" sx={{ flex: 1, border: 'none', borderRadius: 0 }}>
            <Stack direction="row" columnGap={1} alignItems="center">
              <MdLibraryMusic size={18} />
              歌单
            </Stack>
          </ToggleButton>
          <ToggleButton value="2" sx={{ flex: 1, border: 'none', borderRadius: 0 }}>
            <Stack direction="row" columnGap={1} alignItems="center">
              <MdStarBorder size={18} />
              收藏
            </Stack>
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Box sx={{ flex: '1 0 0', overflowY: 'auto' }}>
          <PlaylistMenu selectedKeys={selectedKeys} />
        </Box>
      </Card>
    </Stack>
  );
};

export default Menu;
