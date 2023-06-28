import { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAtom } from 'jotai';
import random from 'lodash/random';
import uniqBy from 'lodash/uniqBy';
import { playQueueAtom } from '@/store/play-queue-atom';
import { PLAY_MODE } from '@/common/constants';

/**
 * 播放
 * 添加到下一首播放
 * 修改播放模式：单曲循环、列表循环、顺序播放、随机播放
 * 移除选择的歌曲
 * 动态排序
 */
const usePlay = () => {
  const [playQueue, setPlayQueue] = useAtom(playQueueAtom);
  const [playMode, setPlayMode] = useState<PLAY_MODE>(PLAY_MODE.LOOP);

  /**
   * 修改播放模式
   */
  const changePlayMode = (mode: PLAY_MODE) => {
    if (mode !== playMode) {
      setPlayMode(mode);
    } else {
      setPlayMode(PLAY_MODE.LOOP);
    }
  };

  const disabledPlay = Boolean(!playQueue.length);

  /**
   * 当前播放歌曲
   */
  const playingSong = useMemo(() => playQueue?.find(({ playing }) => playing), [playQueue]);

  /**
   * 播放所选歌曲
   */
  const play = (song: Song) => {
    // 无版权等不可播放
    if (song.noCopyrightRcmd) return;
    if (song.id === playingSong?.id) return;

    setPlayQueue(produce((draft) => {
      const current = draft?.find(({ id }) => id === playingSong?.id);
      if (current) {
        current.playing = false;
      }

      const exist = draft?.find(({ id }) => id === song.id);

      if (exist) {
        exist.playing = true;
      } else {
        draft.unshift({
          ...song,
          playing: true,
        });
      }
    }));
  };

  /**
   * 上一首
   */
  const prev = () => {
    if (playMode === PLAY_MODE.RANDOM) {
      randomPlay();
      return;
    }

    if (playQueue.length) {
      setPlayQueue(produce((draft) => {
        const currentIndex = playQueue.findIndex(({ id }) => id === playingSong?.id);
        const nextIndex = (currentIndex + playQueue.length - 1) % playQueue.length;
        const current = draft?.find(({ id }) => id === playingSong?.id);
        if (current) {
          current.playing = false;
        }

        const prevSong = draft[nextIndex];
        prevSong.playing = true;
      }));
    }
  };

  /**
   * 随机播放
   */
  const randomPlay = () => {
    setPlayQueue(produce((draft) => {
      const current = draft?.find(({ id }) => id === playingSong?.id);
      if (current) {
        current.playing = false;
      }

      const randomIndex = random(0, playQueue.length);
      const nextSong = draft[randomIndex];
      nextSong.playing = true;
    }));
  };

  /**
   * 下一首
   */
  const next = () => {
    if (playMode === PLAY_MODE.RANDOM) {
      randomPlay();
      return;
    }

    if (playQueue.length) {
      setPlayQueue(produce((draft) => {
        const currentIndex = playQueue.findIndex(({ id }) => id === playingSong?.id);
        const nextIndex = (currentIndex + 1) % playQueue.length;
        const current = draft?.find(({ id }) => id === playingSong?.id);
        if (current) {
          current.playing = false;
        }

        const nextSong = draft[nextIndex];
        nextSong.playing = true;
      }));
    }
  };

  /**
   * 添加到下一首播放
   */
  const addNext = (song: Song) => {
    if (song.id === playingSong?.id) return;

    if (!playQueue.length) {
      play(song);
      return;
    }

    setPlayQueue(produce((draft) => {
      draft.splice(playingSong ? draft.indexOf(playingSong) : 0, 1, song);
    }));
  };

  /**
   * 添加歌曲到播放列表或替换播放列表
   */
  const addPlayQueue = (songList: Song[], clear: boolean = false) => {
    const newPlayQueue = clear ? songList : uniqBy([
      ...playQueue,
      ...songList,
    ], 'id');

    setPlayQueue(newPlayQueue.map((song, i) => {
      const playIndex = playMode === PLAY_MODE.RANDOM ? random(0, songList.length) : 0;
      return i === playIndex ? {
        ...song,
        playing: true,
      } : song;
    }));
  };

  return {
    disabledPlay,
    playQueue,
    playingSong,
    playMode,
    play,
    prev,
    next,
    randomPlay,
    addNext,
    addPlayQueue,
    changePlayMode,
  };
};

export default usePlay;
