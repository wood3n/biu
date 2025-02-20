import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  MdExpand,
  MdPause,
  MdPlayArrow,
  MdPlaylistPlay,
  MdSkipNext,
  MdSkipPrevious,
  MdVolumeDown,
  MdVolumeMute,
  MdVolumeOff,
  MdVolumeUp,
} from "react-icons/md";

import { useBoolean, useRequest } from "ahooks";
import { isNil } from "es-toolkit";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";

import { MUSIC_LEVEL, PLAY_MODE } from "@/common/constants";
import usePlay from "@/common/hooks/usePlay";
import { getLocal, STORAGE_KEY, updateLocal } from "@/common/localforage";
import { formatDuration } from "@/common/utils";
import { getLyrics, getSongUrlV1 } from "@/service";

import ArtistLinks from "../artist-links";
import FullScreenPlayCenter from "../full-screen-play-center";
import Image from "../image";
import OverflowText from "../overflow-text";
import PlayQueueDrawer from "../play-queue-drawer";
import TooltipButton from "../tooltip-button";
import PlayModeToggle from "./play-mode";
import PlayRate from "./play-rate";

import "./index.less";

/**
 * 播放任务栏
 */
function PlayTaskBar() {
  const theme = useTheme();
  const { disabledPlay, playingSong, playMode, prev, next, changePlayMode } = usePlay();
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());
  const [playlistDrawerVisible, { toggle }] = useBoolean();
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  const init = async () => {
    const oldVolume = await getLocal<number>(STORAGE_KEY.VOLUME);
    setVolume(oldVolume || 0.1);
  };

  useEffect(() => {
    init();
  }, []);

  const { data: getLyricsRes, runAsync: reqLyrics } = useRequest(
    () =>
      getLyrics({
        id: playingSong?.id,
      }),
    {
      manual: true,
    },
  );

  const { data, runAsync, loading } = useRequest(
    () =>
      getSongUrlV1({
        id: playingSong?.id,
        level: MUSIC_LEVEL.LOSSLESS,
      }),
    {
      manual: true,
      onSuccess: res => {
        if (!res?.data?.[0]?.url) {
          toast.error("无法获取歌曲播放链接");
        } else {
          reqLyrics();
        }
      },
    },
  );

  useEffect(() => {
    if (playingSong?.id) {
      runAsync();
    }
  }, [playingSong?.id]);

  useEffect(() => {
    audioElRef.current.loop = playMode === PLAY_MODE.SINGLE;
  }, [playMode]);

  useEffect(() => {
    if (data?.data?.[0]?.url) {
      audioElRef.current.src = data.data[0].url;
      audioElRef.current.controls = false;
      audioElRef.current.volume = volume;
      audioElRef.current.preload = "metadata";
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
      audioElRef.current.src = "";
    };
  }, [data?.data?.[0]?.url]);

  const handlePlay = () => {
    if (audioElRef.current) {
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
    updateLocal(STORAGE_KEY.VOLUME, v);
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
          height: "80px",
          padding: "0 8px",
        }}
      >
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
          }}
        >
          {playingSong && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                columnGap: 2,
              }}
            >
              <Image
                src={playingSong?.al?.picUrl}
                mask={{
                  child: <MdExpand size={18} />,
                  onClick: () => setFullScreenOpen(true),
                }}
              />
              <Stack spacing="4px" sx={{ minWidth: 0 }}>
                <OverflowText title={playingSong?.name} sx={{ minWidth: 0 }}>
                  {playingSong?.name}
                </OverflowText>
                <ArtistLinks ars={playingSong?.ar} />
              </Stack>
            </Box>
          )}
        </Grid>
        <Grid item xs={5}>
          <Stack alignItems="center" className="playbar-progress-stack">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton disabled={disabledPlay} size="small" onClick={handlePrev}>
                <MdSkipPrevious size={24} />
              </IconButton>
              <IconButton disabled={disabledPlay} size="small" onClick={paused ? handlePlay : handlePause}>
                {paused ? <MdPlayArrow size={36} /> : <MdPause size={36} />}
              </IconButton>
              <IconButton disabled={disabledPlay} size="small" onClick={handleNext}>
                <MdSkipNext size={24} />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2} style={{ flex: 1, width: "100%" }}>
              <span className="playbar-progress-dt-span">{playingSong ? formatDuration(current, false) : ""}</span>
              <Slider size="small" min={0} max={duration ?? 0} step={1} value={current} disabled={!playingSong} onChange={handleSeek} />
              <span className="playbar-progress-dt-span">{isNil(duration) ? "" : formatDuration(duration, false)}</span>
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <PlayModeToggle value={playMode} onChange={v => changePlayMode(v)} />
          <Stack direction="row" alignItems="center">
            <IconButton size="small" onClick={toggleMuted}>
              {muted ? (
                <MdVolumeOff size={24} />
              ) : volume === 0 ? (
                <MdVolumeMute size={24} />
              ) : volume < 0.5 ? (
                <MdVolumeDown size={24} />
              ) : (
                <MdVolumeUp size={24} />
              )}
            </IconButton>
            <Slider size="small" min={0} max={1} step={0.01} value={volume} onChange={(_, v) => handleChangeVolume(v as number)} style={{ width: 90 }} />
          </Stack>
          <Stack direction="row" spacing="12px" alignItems="center">
            <PlayRate value={rate} onChange={handleChangeRate} />
            <TooltipButton title="播放列表" size="small" onClick={toggle}>
              <MdPlaylistPlay size={24} />
            </TooltipButton>
          </Stack>
        </Grid>
      </Grid>
      <PlayQueueDrawer open={playlistDrawerVisible} onClose={toggle} />
      <FullScreenPlayCenter open={fullScreenOpen} onClose={() => setFullScreenOpen(false)} song={playingSong} lyrics={getLyricsRes?.lrc?.lyric} />
    </>
  );
}

export default PlayTaskBar;
