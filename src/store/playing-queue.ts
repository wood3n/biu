import { create } from "zustand";

interface State {
  /** 当前歌曲 */
  currentSong: Song | null | undefined;
  list: Song[];
}

interface Action {
  /** 播放歌曲 */
  play: (song: Song, newList?: Song[]) => void;
  /** 播放列表 */
  playList: (songs: Song[]) => void;
  /** 当歌曲添加到队列首 */
  unshift: (song: Song[]) => void;
  /** 当歌曲添加到队列尾 */
  push: (song: Song[]) => void;
  /** 添加到下一首播放 */
  insert: (song: Song[]) => void;
  delete: (song: Song[]) => void;
  clear: () => void;
}

/** 播放队列 */
export const usePlayingQueue = create<State & Action>(set => ({
  currentSong: null,
  list: [],
  play: (song, newList) => {
    set(state => {
      // 当播放队列为空时，添加新队列
      if (state.list.length === 0) {
        return { currentSong: song, list: newList };
      }

      // 当歌曲存在于队列中时，直接播放歌曲
      const index = state.list.findIndex(item => item.id === song.id);
      if (index !== -1) {
        return { currentSong: song };
      } else {
        // 当歌曲不存在于队列中时，将歌曲插入到队列中
        const insertIndex = state.currentSong ? state.list.findIndex(item => item.id === state.currentSong!.id) : 0;
        const list = [...state.list];
        list.splice(insertIndex, 0, song);
        return { currentSong: song, list };
      }
    });
  },
  playList: songs => {
    set({ list: songs, currentSong: songs[0] });
  },
  unshift: song => {
    set(state => ({ list: [...song, ...(state.list || [])] }));
  },
  push: song => {
    set(state => ({ list: [...(state.list || []), ...song] }));
  },
  insert: song => {
    set(state => {
      const index = state.currentSong ? state.list?.findIndex(song => song.id === state.currentSong?.id) : 0;
      const list = [...state.list];
      list.splice(index, 0, ...song);
      return { list };
    });
  },
  delete: song => {
    set(state => {
      const filteredIds = song.map(item => item.id);
      return { list: state.list.filter(item => filteredIds.includes(item.id)) };
    });
  },
  clear: () => {
    set({ list: [], currentSong: null });
  },
}));
