import React, { useState, useRef, useEffect } from 'react';
import Typography, { type TypographyTypeMap } from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { MdClose } from 'react-icons/md';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

type Props = TypographyTypeMap['props'] & {
  lines?: number;
}

const StyledButton = styled(Button)(({ theme }) => ({
  width: 'auto',
  color: '#fff',
  minWidth: 0,
  padding: 0,
  lineHeight: 'normal',
  transition: 'none',
  background: theme.palette.grey[900],
  backgroundColor: theme.palette.grey[900],
  boxShadow: `-15px 0px 8px 0px ${theme.palette.grey[900]}`,
  textTransform: 'none',
  '&:hover': {
    background: theme.palette.grey[900],
    backgroundColor: 'none',
    color: theme.palette.primary.main,
  },
  '&:active': {
    background: theme.palette.grey[900],
  },
  '&:focus': {
    background: theme.palette.grey[900],
    padding: 0,
  },
}));

const MultilineOverflowText: React.FC<Props> = ({
  lines = 1,
  children,
  sx,
  ...props
}) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const [open, setOpen] = useState(false);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsOverflow(textRef.current!.scrollHeight > textRef.current!.clientHeight);
  }, []);

  return (
    <>
      <Typography
        ref={textRef}
        {...props}
        sx={{
          position: 'relative',
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          ...sx,
        }}
      >
        {children}
        {isOverflowed && (
          <StyledButton
            className=""
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              color: (theme) => theme.palette.text.secondary,
            }}
            onClick={() => setOpen(true)}
          >
            更多
          </StyledButton>
        )}
      </Typography>
      {isOverflowed && (
        <Dialog scroll="paper" open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            <IconButton
              size="small"
              aria-label="close"
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <MdClose />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{
            padding: 0, width: '600px', height: '500px',
          }}
          >
            <OverlayScrollbarsComponent
              style={{ height: '100%', whiteSpace: 'pre-line', padding: '24px' }}
            >
              {children}
            </OverlayScrollbarsComponent>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MultilineOverflowText;
