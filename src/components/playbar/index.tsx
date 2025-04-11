import { useEffect, useRef, useState } from "react";

import { useRequest } from "ahooks";
import { random } from "es-toolkit";
import { addToast, Button, useDisclosure } from "@heroui/react";
import { RiPlayList2Fill } from "@remixicon/react";

import { MusicLevel } from "@/common/constants";
import { getLocal, STORAGE_KEY } from "@/common/localforage";
import { getLyrics, getSongUrlV1 } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import PlayQueue from "../play-queue-drawer";
import { PlayMode } from "./constants";
import Control from "./control";
import Rate from "./rate";
import SongInfo from "./song-info";
import Volume from "./volume";

/**
 * 播放任务栏
 */
function PlayBar() {
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const audioElRef = useRef<HTMLAudioElement>(new Audio());
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(PlayMode.Sequential);
  const [isRandom, setIsRandom] = useState(false);

  const { isOpen: playlistDrawerVisible, onOpenChange: onPlaylistDrawerOpenChange } = useDisclosure();

  const { currentSong, play, list: playlist, clear: clearPlaylist, delete: deleteSong } = usePlayingQueue();

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

  const { data, loading } = useRequest(
    () =>
      getSongUrlV1({
        id: currentSong?.id,
        level: MusicLevel.Lossless,
      }),
    {
      ready: Boolean(currentSong?.id),
      refreshDeps: [currentSong?.id],
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

  const playPrev = () => {
    stopPlay();
    const index = playlist.findIndex(item => item.id === currentSong?.id);
    let prevIndex = (index - 1 + playlist.length) % playlist.length;
    // 随机播放
    if (isRandom) {
      const randomIndex = random(playlist.length);
      prevIndex = randomIndex === index ? randomIndex + 1 : randomIndex;
    }

    play(playlist[prevIndex]);
  };

  const playNext = (manual = false) => {
    stopPlay();
    const index = playlist.findIndex(item => item.id === currentSong?.id);
    const isLast = index === playlist.length - 1;
    if (isLast && playMode === PlayMode.Sequential && !isRandom && !manual) {
      return;
    }

    let nextIndex = (index + 1) % playlist.length;
    // 随机播放
    if (isRandom) {
      const randomIndex = random(playlist.length);
      nextIndex = randomIndex === index ? randomIndex + 1 : randomIndex;
    }

    play(playlist[nextIndex]);
  };

  const handleSeek = (playTime: number | number[]) => {
    setProgress(playTime as number);
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
    if (v === PlayMode.Single) {
      audioElRef.current.loop = true;
    }
  };

  // 注册系统播放会话
  const registerMediaSession = () => {
    if (currentSong && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.name,
        artist: currentSong?.ar?.map(ar => ar.name).join("/"),
        album: currentSong.al?.name,
        artwork: [{ src: currentSong.al?.picUrl as string, sizes: "512x512" }],
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        playPrev();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNext();
      });
    }
  };

  useEffect(() => {
    if (data?.data?.[0]?.url) {
      registerMediaSession();

      audioElRef.current.src = data.data[0].url;
      audioElRef.current.controls = false;
      audioElRef.current.volume = volume;
      audioElRef.current.preload = "metadata";
      audioElRef.current.playbackRate = rate;

      audioElRef.current.onloadedmetadata = () => {
        setDuration(Math.floor(audioElRef.current.duration));
      };

      audioElRef.current.ontimeupdate = () => {
        setProgress(Math.floor(audioElRef.current.currentTime));
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
          return;
        }

        playNext();
      };
    }

    return () => {
      // https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
      audioElRef.current.src = "";
    };
  }, [data?.data?.[0]?.url]);

  const handleDeleteSongFromPlaylist = (song: Song) => {
    if (currentSong?.id === song.id) {
      playNext();
    }

    deleteSong([song]);
  };

  const handleClearPlaylist = () => {
    stopPlay();
    clearPlaylist();
  };

  const isPlaylistEmpty = !playlist?.length;

  return (
    <div className="h-20 px-6">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] space-x-6">
        <div className="h-full">
          <If condition={currentSong?.id}>
            <SongInfo song={currentSong!} />
          </If>
        </div>
        <Control
          disabled={isPlaylistEmpty}
          loading={loading}
          progress={progress}
          duration={duration}
          paused={paused}
          playMode={playMode}
          isRandom={isRandom}
          onSeek={handleSeek}
          onPlay={togglePlay}
          onNext={() => playNext(true)}
          onPrev={playPrev}
          onToggleRandomPlay={() => setIsRandom(!isRandom)}
          onChangePlayMode={handleChangeMode}
        />
        <div className="flex h-full items-center justify-end space-x-2">
          <Rate value={rate} onChange={handleChangeRate} />
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onPlaylistDrawerOpenChange}
            className="hover:text-green-500"
          >
            <RiPlayList2Fill size={18} />
          </Button>
          <Volume value={volume} onChange={handleChangeVolume} isMuted={muted} onChangeMute={setMuted} />
        </div>
      </div>
      <PlayQueue
        isOpen={playlistDrawerVisible}
        onOpenChange={onPlaylistDrawerOpenChange}
        onClearPlaylist={handleClearPlaylist}
        onDeleteSong={handleDeleteSongFromPlaylist}
      />
    </div>
  );
}

export default PlayBar;
