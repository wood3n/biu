import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import {
  MdPlayArrow,
  MdPause,
  MdSkipPrevious,
  MdSkipNext,
  MdRepeatOne,
  MdClose,
  MdExpand,
  MdVolumeMute,
  MdVolumeDown,
  MdVolumeUp,
  MdVolumeOff,
  MdAddCircleOutline,
  MdOutlineFavoriteBorder,
  MdOutlineMusicNote,
  MdOutlinePlaylistPlay,
  MdFastRewind,
  MdFastForward,
  MdPlaylistPlay,
  MdOutlineFavorite,
  MdPlaylistAdd,
} from 'react-icons/md';
import { useAtom, useAtomValue } from 'jotai';
import { useLikelist } from '@/store/likelist-atom';
import { playingSongAtom } from '@/store/current-play-atom';
import { formatDuration } from '@/common/utils';
import type { Song } from '@service/playlist-track-all';
import { useRequest, useBoolean } from 'ahooks';
import { getSongUrlV1 } from '@/service';
import { MUSIC_LEVEL } from '@/common/constants';
import PlayRate from './play-rate';
import SongDescription from '../song-description';
import TooltipButton from '../tooltip-button';
import LikeAction from '../like-action-button';
import PlaylistDrawer from '../PlaylistDrawer';
import './index.less';

/**
 * 播放任务栏
 */
const PlayTaskBar = () => {
  const playingSong = useAtomValue(playingSongAtom);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0.2);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());

  const [playlistDrawerVisible, { toggle }] = useBoolean();

  const { data, runAsync, loading } = useRequest(() => getSongUrlV1({
    id: playingSong?.id,
    level: MUSIC_LEVEL.LOSSLESS,
  }), { manual: true });

  // useEffect(() => {
  //   if (playingSong?.id) {
  //     runAsync();
  //   }
  // }, [playingSong]);

  useEffect(() => {
    if (data?.data?.[0]?.url) {
      audioElRef.current.src = data.data[0].url;
      audioElRef.current.controls = false;
      audioElRef.current.volume = volume;
      audioElRef.current.preload = 'metadata';
      audioElRef.current.crossOrigin = 'use-credentials';
      audioElRef.current.playbackRate = rate;

      audioElRef.current.onloadedmetadata = () => {
        setDuration(Math.floor(audioElRef.current.duration));
      };

      audioElRef.current.ontimeupdate = () => {
        setCurrent(Math.floor(audioElRef.current.currentTime));
      };

      audioElRef.current.onplay = () => {
        setPaused(false);
      };

      audioElRef.current.onpause = () => {
        setPaused(true);
      };

      audioElRef.current.oncanplay = () => {
        audioElRef.current.play();
      };
    }

    return () => {
      // https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
      audioElRef.current.src = '';
    };
  }, [data?.data?.[0]?.url]);

  // 前一首
  const handlePrev = () => {

  };

  const handleNext = () => {

  };

  const handlePlay = () => {

  };

  const handlePause = () => {

  };

  const handleSeek = () => {

  };

  const handleChangeVolume = (v: number) => {
    setVolume(v);
    audioElRef.current.volume = v;
  };

  const toggleMuted = () => {
    audioElRef.current.muted = !muted;
    setMuted(!muted);
  };

  // 修改播放速率
  const handleChangeRate = (v: string) => {
    setRate(Number(v));
    if (audioElRef.current) {
      audioElRef.current.playbackRate = Number(v);
    }
  };

  return (
    <Grid container columnSpacing={4} sx={{ height: '80px', padding: '0 24px' }}>
      <Grid item xs={3} className="playbar-action-left">
        {playingSong && (
          <>
            <SongDescription
              picUrl={playingSong.al?.picUrl}
              name={playingSong.name}
              ar={playingSong.ar}
            />
            <LikeAction id={playingSong?.id} />
            <TooltipButton title="收藏" size="small">
              <MdPlaylistAdd size={24} />
            </TooltipButton>
          </>
        )}
      </Grid>
      <Grid item xs={6}>
        <Stack alignItems="center" className="playbar-progress-stack">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <IconButton size="small" aria-label="previous song">
              <MdSkipPrevious size={24} />
            </IconButton>
            <IconButton
              size="small"
              aria-label={paused ? 'play' : 'pause'}
              onClick={() => setPaused(!paused)}
            >
              {paused ? (
                <MdPlayArrow size={36} />
              ) : (
                <MdPause size={36} />
              )}
            </IconButton>
            <IconButton size="small" aria-label="next song">
              <MdSkipNext size={24} />
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            style={{ flex: 1, width: '100%' }}
          >
            <span className="playbar-progress-dt-span">
              {playingSong ? formatDuration(current) : ''}
            </span>
            <Slider
              size="small"
              valueLabelDisplay="auto"
              min={0}
              max={duration}
              step={1}
              value={current}
              disabled={!playingSong}
              onChange={handleSeek}
            />
            <span className="playbar-progress-dt-span">
              {playingSong?.dt ? formatDuration(playingSong.dt) : ''}
            </span>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={3} className="playbar-action-right">
        <Stack direction="row" alignItems="center">
          <IconButton size="small" onClick={toggleMuted}>
            {muted
              ? <MdVolumeOff size={24} />
              : volume === 0
                ? <MdVolumeMute size={24} />
                : volume < 0.5
                  ? <MdVolumeDown size={24} />
                  : <MdVolumeUp size={24} />}
          </IconButton>
          <Slider
            size="small"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(_, v) => handleChangeVolume(v as number)}
            style={{ width: 90 }}
          />
        </Stack>
        <Stack direction="row" spacing="12px" alignItems="center">
          <TooltipButton title="单曲循环" size="small">
            <MdRepeatOne size={24} />
          </TooltipButton>
          <PlayRate value={rate} onChange={(v) => setRate(v)} />
          <TooltipButton title="播放列表" size="small">
            <MdPlaylistPlay size={24} />
          </TooltipButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PlayTaskBar;
