import * as React from 'react';
import {
  Outlet, Navigate, useLocation,
} from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Container from '@mui/material/Container';
import ElevationScroll from '@components/elevation-scroll';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import PlayTaskBar from '@/components/playbar';

const GridLayout = () => (
  <Stack spacing={2} sx={{ padding: '12px', height: '100vh' }}>
    <CssBaseline />
    <Grid container columnSpacing={2} sx={{ flex: 1 }}>
      <Grid item xs={3}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Card>
            <List>
              {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
          <Card sx={{ flex: 1, height: 0 }}>
            <List sx={{ height: '100%' }}>
              {Array(20).fill(0).map((text, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Stack>
      </Grid>
      <Grid item xs={9}>
        <Card sx={{ height: '100%' }}>
          3
        </Card>
      </Grid>
    </Grid>
    <Card>
      <Box sx={{ flex: 0 }}>
        <PlayTaskBar />
      </Box>
    </Card>
  </Stack>
);

export default GridLayout;
