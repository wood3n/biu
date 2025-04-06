import { useEffect, useRef, useState } from "react";

import { useBoolean, useRequest } from "ahooks";
import { addToast, Button } from "@heroui/react";
import {
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiPlayList2Fill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";

import { MusicLevel } from "@/common/constants";
import { getLocal, STORAGE_KEY } from "@/common/localforage";
import { formatDuration } from "@/common/utils";
import { getLyrics, getSongUrlV1 } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import PlayQueue from "../play-queue-drawer";
import SongBriefInfo from "../song-brief-info";
import SwitchFavorite from "../switch-favorite";
import { PlayBarStyle, PlayMode } from "./constants";
import Mode from "./mode";
import Rate from "./rate";
import Slider from "./slider";
import Volume from "./volume";

/**
 * 播放任务栏
 */
function PlayBar() {
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());
  const [playlistDrawerVisible, { toggle }] = useBoolean(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(PlayMode.Sequential);

  const { currentSong } = usePlayingQueue();

  const init = async () => {
    const oldVolume = await getLocal<number>(STORAGE_KEY.VOLUME);
    setVolume(oldVolume || 0.1);
  };

  useEffect(() => {
    init();
  }, []);

  const { data: getLyricsRes, runAsync: reqPlayLyrics } = useRequest(
    () =>
      getLyrics({
        id: currentSong?.id,
      }),
    {
      manual: true,
    },
  );

  const {
    data,
    runAsync: getPlayData,
    loading,
  } = useRequest(
    () =>
      getSongUrlV1({
        id: currentSong?.id,
        level: MusicLevel.Lossless,
      }),
    {
      manual: true,
      onSuccess: res => {
        if (!res?.data?.[0]?.url) {
          addToast({
            title: "无法获取歌曲播放链接",
            color: "danger",
          });
        } else {
          reqPlayLyrics();
        }
      },
    },
  );

  useEffect(() => {
    if (currentSong?.id) {
      getPlayData();
    }
  }, [currentSong?.id]);

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
        setPlayProgress(Math.floor(audioElRef.current.currentTime));
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
        if (playMode !== PlayMode.Single) {
        }
      };
    }

    return () => {
      // https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
      audioElRef.current.src = "";
    };
  }, [data?.data?.[0]?.url]);

  const stopPlay = () => {
    audioElRef.current.pause();
    audioElRef.current.currentTime = 0;
    setDuration(null);
  };

  const togglePlay = () => {
    if (paused && audioElRef.current) {
      audioElRef.current.play();
    } else {
      audioElRef.current.pause();
      setPaused(true);
    }
  };

  const handlePrev = () => {
    stopPlay();
  };

  const handleNext = () => {
    stopPlay();
  };

  const handleSeek = (playTime: number | number[]) => {
    setPlayProgress(playTime as number);
    audioElRef.current.currentTime = playTime as number;
  };

  const handleChangeVolume = (v: number) => {
    setVolume(v);
    audioElRef.current.volume = v;
  };

  // 修改播放速率
  const handleChangeRate = (v: number) => {
    setRate(v);
    if (audioElRef.current) {
      audioElRef.current.playbackRate = v;
    }
  };

  // 切换播放模式
  const handleChangeMode = (v: PlayMode) => {
    setPlayMode(v);
  };

  return (
    <div className="h-20 px-6">
      <div className="flex h-full items-center space-x-6">
        <div className="flex h-full flex-1 items-center justify-start space-x-4">
          <If condition={currentSong?.id}>
            <SongBriefInfo name={currentSong?.name} ars={currentSong?.ar} coverUrl={currentSong?.al?.picUrl} />
            <SwitchFavorite id={currentSong?.id as number} />
          </If>
        </div>
        <div className="flex h-full min-w-0 flex-3 flex-col items-center justify-center space-y-0.5 px-6">
          <div className="flex items-center space-x-6">
            <Button isIconOnly size="sm" variant="light" className="hover:text-green-500">
              <RiSkipBackFill size={PlayBarStyle.SecondIconSize} />
            </Button>
            <Button isIconOnly variant="light" radius="full" className="hover:text-green-500" onPress={togglePlay}>
              {paused ? (
                <RiPlayCircleFill size={PlayBarStyle.MainPlayIconSize} />
              ) : (
                <RiPauseCircleFill size={PlayBarStyle.MainPlayIconSize} />
              )}
            </Button>
            <Button isIconOnly size="sm" variant="light" className="hover:text-green-500">
              <RiSkipForwardFill size={PlayBarStyle.SecondIconSize} />
            </Button>
          </div>
          <Slider
            hideThumb
            className="w-3/4 cursor-pointer"
            minValue={0}
            maxValue={duration || 0}
            value={playProgress}
            startContent={
              <span className="whitespace-nowrap text-sm opacity-70">
                {playProgress ? formatDuration(playProgress, false) : "-:--"}
              </span>
            }
            // @ts-ignore value is number
            onChange={handleSeek}
            endContent={
              <span className="whitespace-nowrap text-sm opacity-70">
                {duration ? formatDuration(duration, false) : "-:--"}
              </span>
            }
          />
        </div>
        <div className="flex h-full flex-1 items-center justify-end space-x-2">
          <Mode value={playMode} onChange={handleChangeMode} />
          <Rate value={rate} onChange={handleChangeRate} />
          <Volume value={volume} onChange={handleChangeVolume} isMuted={muted} onChangeMute={setMuted} />
          <Button isIconOnly size="sm" variant="light" onPress={toggle} className="hover:text-green-500">
            <RiPlayList2Fill size={PlayBarStyle.SideIconSize} />
          </Button>
        </div>
      </div>
      <PlayQueue isOpen={playlistDrawerVisible} onOpenChange={toggle} />
    </div>
  );
}

export default PlayBar;
