import { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { toast } from 'react-hot-toast';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import localforage from 'localforage';
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
import { ReactComponent as RandomIcon } from '@/assets/icons/random.svg';
import { ReactComponent as RepeatOneIcon } from '@/assets/icons/repeatone.svg';
import { formatDuration } from '@/common/utils';
import { useRequest, useBoolean } from 'ahooks';
import isNil from 'lodash/isNil';
import { getSongUrlV1 } from '@/service';
import { MUSIC_LEVEL, PLAY_MODE } from '@/common/constants';
import usePlay from '@/common/hooks/usePlay';
import PlayRate from './play-rate';
import PlayModeToggle from './play-mode';
import SongDescription from '../song-description';
import TooltipButton from '../tooltip-button';
import LikeAction from '../like-action-button';
import PlayQueueDrawer from '../play-queue-drawer';
import './index.less';

/**
 * 播放任务栏
 */
const PlayTaskBar = () => {
  const theme = useTheme();
  const {
    disabledPlay,
    playingSong,
    playMode,
    prev,
    next,
    changePlayMode,
  } = usePlay();
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());
  const [playlistDrawerVisible, { toggle }] = useBoolean();

  const init = async () => {
    const oldVolume: number | null = await localforage.getItem('volume');
    setVolume(oldVolume || 0.1);
  };

  const { data, runAsync, loading } = useRequest(() => getSongUrlV1({
    id: playingSong?.id,
    level: MUSIC_LEVEL.LOSSLESS,
  }), {
    manual: true,
    onSuccess: (res) => {
      if (!res?.data?.[0]?.url) {
        toast.error('无法获取歌曲播放链接');
      }
    },
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (playingSong?.id) {
      runAsync();
    }
  }, [playingSong]);

  useEffect(() => {
    audioElRef.current.loop = (playMode === PLAY_MODE.SINGLE);
  }, [playMode]);

  useEffect(() => {
    if (data?.data?.[0]?.url) {
      audioElRef.current.src = data.data[0].url;
      audioElRef.current.controls = false;
      audioElRef.current.volume = volume;
      audioElRef.current.preload = 'metadata';
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
        setPaused(false);
        audioElRef.current.play();
      };

      audioElRef.current.onended = () => {
        if (playMode !== PLAY_MODE.SINGLE) {
          next();
        }
      };
    }

    return () => {
      // https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
      audioElRef.current.src = '';
    };
  }, [data?.data?.[0]?.url]);

  const handlePlay = () => {
    if (data?.data?.[0]?.url && audioElRef.current) {
      audioElRef.current.play();
    }
  };

  const stopPlay = () => {
    audioElRef.current.pause();
    audioElRef.current.currentTime = 0;
    setDuration(null);
  };

  const handlePause = () => {
    setPaused(true);
    audioElRef.current.pause();
  };

  const handlePrev = () => {
    stopPlay();
    prev();
  };

  const handleNext = () => {
    stopPlay();
    next();
  };

  const handleSeek = (_: Event, playTime: number | number[]) => {
    setCurrent(playTime as number);
    audioElRef.current.currentTime = playTime as number;
  };

  const handleChangeVolume = (v: number) => {
    setVolume(v);
    audioElRef.current.volume = v;
    localforage.setItem('volume', v);
  };

  const toggleMuted = () => {
    audioElRef.current.muted = !muted;
    setMuted(!muted);
  };

  // 修改播放速率
  const handleChangeRate = (v: number) => {
    setRate(v);
    if (audioElRef.current) {
      audioElRef.current.playbackRate = v;
    }
  };

  return (
    <>
      <Grid
        container
        columnGap={4}
        flexWrap="nowrap"
        sx={{
          height: '80px',
          padding: '0 8px',
        }}
      >
        <Grid
          item
          xs={3}
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {playingSong && (
            <SongDescription
              picUrl={playingSong.al?.picUrl}
              name={playingSong.name}
              ar={playingSong.ar}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          <Stack alignItems="center" className="playbar-progress-stack">
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              {/* <TooltipButton
                title="随机播放"
                placement="top"
                size="small"
                disabled={disabledPlay}
                onClick={() => changePlayMode(PLAY_MODE.RANDOM)}
              >
                <RandomIcon
                  width={18}
                  height={18}
                  fill={disabledPlay
                    ? theme.palette.action.disabled
                    : playMode === PLAY_MODE.RANDOM
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary}
                />
              </TooltipButton> */}
              <IconButton disabled={disabledPlay} size="small" onClick={handlePrev}>
                <MdSkipPrevious size={24} />
              </IconButton>
              <IconButton
                disabled={disabledPlay}
                size="small"
                onClick={paused ? handlePlay : handlePause}
              >
                {paused ? (
                  <MdPlayArrow size={36} />
                ) : (
                  <MdPause size={36} />
                )}
              </IconButton>
              <IconButton
                disabled={disabledPlay}
                size="small"
                onClick={handleNext}
              >
                <MdSkipNext size={24} />
              </IconButton>
              {/* <TooltipButton
                title="单曲循环"
                placement="top"
                size="small"
                disabled={disabledPlay}
                onClick={() => changePlayMode(PLAY_MODE.SINGLE)}
              >
                <RepeatOneIcon
                  width={18}
                  height={18}
                  fill={disabledPlay
                    ? theme.palette.action.disabled
                    : playMode === PLAY_MODE.SINGLE
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary}
                />
              </TooltipButton> */}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              style={{ flex: 1, width: '100%' }}
            >
              <span className="playbar-progress-dt-span">
                {playingSong ? formatDuration(current, false) : ''}
              </span>
              <Slider
                size="small"
                min={0}
                max={duration ?? 0}
                step={1}
                value={current}
                disabled={!playingSong}
                onChange={handleSeek}
              />
              <span className="playbar-progress-dt-span">
                {isNil(duration) ? '' : formatDuration(duration, false)}
              </span>
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs={3}
          sx={{
            minWidth: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            columnGap: '8px',
          }}
        >
          <PlayModeToggle value={playMode} onChange={(v) => changePlayMode(v)} />
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
            <PlayRate value={rate} onChange={handleChangeRate} />
            <TooltipButton
              title="播放列表"
              size="small"
              onClick={toggle}
            >
              <MdPlaylistPlay size={24} />
            </TooltipButton>
          </Stack>
        </Grid>
      </Grid>
      <PlayQueueDrawer
        open={playlistDrawerVisible}
        onClose={toggle}
      />
    </>
  );
};

export default PlayTaskBar;
