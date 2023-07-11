import React from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import {
  MdClose,
} from 'react-icons/md';
import type { TransitionProps } from '@mui/material/transitions';
import BlurBackground from './blur-background';
import Image from '../image';
import LyricsList from '../lyrics-list';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  song?: Song;
  lyrics?: string;
  volume: number;
  rate: number;
  duration: number;
  current: number;
}

const Transition = React.forwardRef((
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) => <Slide direction="up" ref={ref} {...props} />);

const FullScreenPlayCenter = React.memo(({
  open,
  onClose,
  song,
  lyrics,
  volume,
  rate,
  duration,
  current,
}: Props) => (
  <Dialog
    fullScreen
    open={open}
    onClose={onClose}
    TransitionComponent={Transition}
  >
    {song?.al?.picUrl && <BlurBackground backgroundImageUrl={song?.al?.picUrl} />}
    <Container
      maxWidth="lg"
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
      }}
    >
      <Grid container spacing={4}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '12px',
            right: '12px',
          }}
        >
          <MdClose />
        </IconButton>
        <Grid item xs={8}>
          <Image
            circle
            width={240}
            height={240}
            src={song?.al?.picUrl}
          />
        </Grid>
        <Grid item xs={4}>
          <LyricsList lyrics={lyrics} />
        </Grid>
      </Grid>
    </Container>
  </Dialog>
));

export default FullScreenPlayCenter;
