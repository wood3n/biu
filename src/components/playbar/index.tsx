import { useEffect, useRef, useState } from "react";

import { useBoolean, useRequest } from "ahooks";
import { addToast } from "@heroui/react";

import { MusicLevel, PlayMode } from "@/common/constants";
import { getLocal, STORAGE_KEY, updateLocal } from "@/common/localforage";
import { getLyrics, getSongUrlV1 } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";

import PlayQueueDrawer from "../play-queue-drawer";

/**
 * 播放任务栏
 */
function PlayBar() {
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());
  const [playlistDrawerVisible, { toggle }] = useBoolean();
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(PlayMode.Random);

  const { currentSong } = usePlayingQueue();

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
        id: currentSong?.id,
      }),
    {
      manual: true,
    },
  );

  const { data, runAsync, loading } = useRequest(
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
          reqLyrics();
        }
      },
    },
  );

  useEffect(() => {
    if (currentSong?.id) {
      runAsync();
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
        if (playMode !== PlayMode.Single) {
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
  };

  const handleNext = () => {
    stopPlay();
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
    <div className="h-24">
      <div>play</div>
      <PlayQueueDrawer isOpen={playlistDrawerVisible} onOpenChange={toggle} />
    </div>
  );
}

export default PlayBar;
