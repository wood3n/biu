import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const PlayListSkeleton = () => (
  <Box sx={{ padding: '24px', display: 'flex', columnGap: 2 }}>
    <Skeleton
      variant="rectangular"
      sx={{ borderRadius: (theme) => `${theme.shape.borderRadius}px` }}
      width={160}
      height={160}
    />
    <Stack spacing={2}>
      <Skeleton />
      <Skeleton width="60%" />
    </Stack>
  </Box>
);

export default PlayListSkeleton;
