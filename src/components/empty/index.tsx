import React from 'react';
import {
  Typography, Stack, useTheme,
} from '@mui/material';
import { ReactComponent as IconEmpty } from '@/assets/icons/empty.svg';

interface Props {
  description: React.ReactNode;
  action?: React.ReactNode;
}

const Empty = React.memo(({
  description,
  action,
}: Props) => {
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
      <Typography variant="body2">{description}</Typography>
      {action}
    </Stack>
  );
});

export default Empty;
