import React, { useState } from 'react';
import { type DailySong } from '@service/recommend-songs';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import {
  MdPlayArrow,
  MdSkipNext,
  MdAdd,
  MdFileDownload,
  MdMoreHoriz,
  MdAccessTime,
  MdOutlineFavorite,
  MdOutlineFavoriteBorder,
} from 'react-icons/md';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { formatDuration } from '@/common/utils';
import Container from '@mui/material/Container';
import { Audio as AudioSpinner } from 'react-loader-spinner';
import { useAtomValue } from 'jotai';
import { likelistAtom } from '@/store/likelistAtom';
import SongDescription from '../song-description';
import TooltipButton from '../tooltip-button';
import OverflowText from '../overflow-text';
import './index.less';

interface Props {
  data: DailySong[];
}

const SongList: React.FC<Props> = ({
  data,
}) => {
  const likelist = useAtomValue(likelistAtom);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <ListItem>
        <Grid container>
          <Grid item xs={1}>
            <ListItemText>#</ListItemText>
          </Grid>
          <Grid item xs={1}>
            <ListItemText>歌曲</ListItemText>
          </Grid>
          <Grid item xs={1}>
            <ListItemText>专辑</ListItemText>
          </Grid>
          <Grid item xs={1}>
            <ListItemText>
              <MdAccessTime />
            </ListItemText>
          </Grid>
        </Grid>
      </ListItem>
      {data.map(({
        al, ar, id, name, dt,
      }, index) => (
        <ListItemButton key={id}>
          <Grid
            container
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setHovered(false);
            }}
            spacing={2}
          >
            <Grid item xs="auto">
              <Container style={{ width: 60 }}>
                {playing
                  ? <AudioSpinner width={18} height={18} />
                  : index + 1}
              </Container>
            </Grid>
            <Grid item xs alignItems="center">
              <SongDescription
                picUrl={al?.picUrl}
                name={name}
                ar={ar}
              />
            </Grid>
            {/* <Grid item xs={1}>
              {id && likelist.includes(id)
                ? (
                  <TooltipButton tooltip="取消喜欢">
                    <MdOutlineFavorite size={24} style={{ color: 'red' }} />
                  </TooltipButton>
                )
                : hovered && (
                  <TooltipButton tooltip="喜欢">
                    <MdOutlineFavoriteBorder size={24} />
                  </TooltipButton>
                )}
            </Grid> */}
            <Grid item alignItems="center" xs={4}>
              <OverflowText
                title={al?.name}
              >
                {al?.name ?? '-'}
              </OverflowText>
            </Grid>
            <Grid item alignItems="center" xs={1}>
              {formatDuration(dt)}
            </Grid>
          </Grid>
        </ListItemButton>
      ))}
    </List>
  );
};

export default SongList;
