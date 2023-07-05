import React from 'react';
import {
  Typography, Stack, useTheme,
} from '@mui/material';
import { ReactComponent as IconEmpty } from '@/assets/icons/empty.svg';

const Empty = React.memo(() => {
  const theme = useTheme();

  return (
    <Stack
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: '400px',
        color: (theme) => theme.palette.text.secondary,
      }}
    >
      <IconEmpty width={32} height={32} color={theme.palette.text.secondary} />
      <Typography variant="body2">暂无音乐</Typography>
    </Stack>
  );
});

export default Empty;
