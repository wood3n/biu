import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
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
} from 'react-icons/md';
import { useAtom, useAtomValue } from 'jotai';
import { useLikelist } from '@/store/likelistAtom';
import { playingSongAtom } from '@/store/playingSongAtom';
import { formatDuration } from '@/common/utils';
import type { Song } from '@service/playlist-track-all';
import { useRequest, useBoolean } from 'ahooks';
import { getSongUrlV1 } from '@/service';
import { MUSIC_LEVEL } from '@/common/constants';
import SongDescription from '../song-description';
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
    <div className="play-taskbar">
      <div className="play-taskbar-left">
        {playingSong && (
          <SongDescription
            picUrl={playingSong.al?.picUrl}
            name={playingSong.name}
            ar={playingSong.ar}
          />
        )}
      </div>
      <div className="play-taskbar-center">
        <div className="play-action">
          <a className="play-prev" onClick={handlePrev}><MdSkipPrevious size={24} /></a>
          {paused ? (
            <a className="play-play" onClick={handlePlay}>
              <MdPlayCircleFilled size={36} />
            </a>
          ) : (
            <a className="play-pause" onClick={handlePause}>
              <MdPauseCircleFilled size={36} />
            </a>
          )}
          <a className="play-next" onClick={handleNext}><MdSkipNext size={24} /></a>
        </div>
        <div className="play-progress">
          <span className="play-current-time">{formatDuration(current)}</span>
          <Slider
            min={0}
            max={duration}
            step={1}
            value={current}
            onChange={handleSeek}
            style={{ flex: 1 }}
          />
          <span className="play-total-time">
            {playingSong?.dt ? formatDuration(playingSong.dt) : '00:00'}
          </span>
        </div>
      </div>
      <div className="play-taskbar-right">
        <span className="play-volume">
          <a className="play-volume-toggle-mute" onClick={toggleMuted}>
            {muted
              ? <MdVolumeOff size={24} />
              : volume === 0
                ? <MdVolumeMute size={24} />
                : volume < 0.5
                  ? <MdVolumeDown size={24} />
                  : <MdVolumeUp size={24} />}
          </a>
          <Slider
            size="small"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(_, v) => handleChangeVolume(v as number)}
            style={{ width: 120 }}
            sx={{
              color: '#fff',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                backgroundColor: '#fff',
                '&:before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
          />
        </span>
        <a className="play-mode"><MdRepeatOne size={24} /></a>
        {/* <Dropdown
          menu={{
            items: [
              { key: '0.5', label: '0.5x' },
              { key: '1', label: '1x' },
              { key: '1.5', label: '1.5x' },
              { key: '2', label: '2x' },
            ],
            selectedKeys: [String(rate)],
            onClick: ({ key }) => handleChangeRate(key),
          }}
          placement="top"
        >
          <a className="play-rate">{`${rate}x`}</a>
        </Dropdown> */}
        <a onClick={toggle}><MdOutlinePlaylistPlay size={24} /></a>
      </div>
      <PlaylistDrawer
        onClose={toggle}
        visible={playlistDrawerVisible}
      />
    </div>
  );
};

export default PlayTaskBar;
