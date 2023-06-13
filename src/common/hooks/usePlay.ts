import { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAtom } from 'jotai';
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
  console.log(playQueue);

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

  /**
   * 当前播放歌曲
   */
  const playingSong = useMemo(() => playQueue?.find(({ playing }) => playing), [playQueue]);

  /**
   * 播放所选歌曲
   */
  const play = (song: Song) => {
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
    if (clear) {
      setPlayQueue(produce(songList, (draft) => {
        const first = draft[0];
        first.playing = true;
      }));
    } else {
      setPlayQueue([
        ...playQueue,
        ...songList,
      ]);
    }
  };

  return {
    playQueue,
    playingSong,
    playMode,
    play,
    addNext,
    addPlayQueue,
    changePlayMode,
  };
};

export default usePlay;
