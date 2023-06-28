import React from 'react';
import Typography, { type TypographyTypeMap } from '@mui/material/Typography';

type Props = TypographyTypeMap['props'] & {
  lines?: number;
}

const MultilineOverflowText: React.FC<Props> = ({
  lines = 1,
  children,
  ...props
}) => (
  <Typography
    {...props}
    sx={{
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }}
  >
    {children}
  </Typography>
);

export default MultilineOverflowText;
