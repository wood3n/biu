import { addToast } from "@heroui/react";
import { uniqueId } from "es-toolkit/compat";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { PlayItem } from "@/store/play-list";
import type { UserPlaylistItem } from "@/types/user-playlist";

import { StoreNameMap } from "@shared/store";

interface State {
  playlists: UserPlaylistItem[];
}

interface Action {
  /** 创建歌单，返回歌单 id */
  createPlaylist: (name: string, description?: string) => string;
  /** 重命名歌单 */
  renamePlaylist: (id: string, name: string) => void;
  /** 删除歌单 */
  deletePlaylist: (id: string) => void;
  /** 向歌单中添加歌曲（自动去重） */
  addSongsToPlaylist: (playlistId: string, songs: PlayItem[]) => void;
  /** 从歌单中移除指定索引的歌曲 */
  removeSongFromPlaylist: (playlistId: string, songIndex: number) => void;
  /** 调整歌单歌曲顺序 */
  reorderPlaylistSongs: (playlistId: string, fromIndex: number, toIndex: number) => void;
  /** 调整歌单列表顺序 */
  reorderPlaylists: (fromIndex: number, toIndex: number) => void;
}

export const useUserPlaylistStore = create<State & Action>()(
  persist(
    immer(set => ({
      playlists: [],

      createPlaylist: (name, description) => {
        const id = uniqueId("upl-");
        const now = Date.now();
        set(state => {
          state.playlists.push({
            id,
            name: name.trim(),
            description: description?.trim(),
            createdAt: now,
            updatedAt: now,
            songs: [],
          });
        });
        return id;
      },

      renamePlaylist: (id, name) => {
        set(state => {
          const pl = state.playlists.find(p => p.id === id);
          if (pl) {
            pl.name = name.trim();
            pl.updatedAt = Date.now();
          }
        });
      },

      deletePlaylist: id => {
        set(state => {
          state.playlists = state.playlists.filter(p => p.id !== id);
        });
      },

      addSongsToPlaylist: (playlistId, songs) => {
        set(state => {
          const pl = state.playlists.find(p => p.id === playlistId);
          if (pl) {
            const existingIds = new Set(pl.songs.map(s => s.bvid ?? s.sid?.toString() ?? s.id ?? ""));
            const newSongs = songs.filter(s => !existingIds.has(s.bvid ?? s.sid?.toString() ?? s.id ?? ""));
            if (newSongs.length === 0) {
              addToast({ title: "歌单中已存在这些歌曲", color: "warning" });
              return;
            }
            pl.songs.push(...newSongs);
            pl.updatedAt = Date.now();
            addToast({ title: `已添加 ${newSongs.length} 首到「${pl.name}」`, color: "success" });
          }
        });
      },

      removeSongFromPlaylist: (playlistId, songIndex) => {
        set(state => {
          const pl = state.playlists.find(p => p.id === playlistId);
          if (pl && songIndex >= 0 && songIndex < pl.songs.length) {
            pl.songs.splice(songIndex, 1);
            pl.updatedAt = Date.now();
          }
        });
      },

      reorderPlaylistSongs: (playlistId, fromIndex, toIndex) => {
        set(state => {
          const pl = state.playlists.find(p => p.id === playlistId);
          if (pl && fromIndex >= 0 && toIndex >= 0) {
            const [moved] = pl.songs.splice(fromIndex, 1);
            pl.songs.splice(toIndex, 0, moved);
            pl.updatedAt = Date.now();
          }
        });
      },

      reorderPlaylists: (fromIndex, toIndex) => {
        set(state => {
          if (fromIndex < 0 || toIndex < 0 || fromIndex >= state.playlists.length || toIndex >= state.playlists.length)
            return;
          const [moved] = state.playlists.splice(fromIndex, 1);
          state.playlists.splice(toIndex, 0, moved);
        });
      },
    })),
    {
      name: StoreNameMap.UserPlaylists,
      partialize: state => ({ playlists: state.playlists }),
      storage: {
        getItem: async () => {
          const store = await window.electron.getStore(StoreNameMap.UserPlaylists);
          return { state: store ?? { playlists: [] } };
        },
        setItem: async (_, value) => {
          if (value.state) {
            await window.electron.setStore(StoreNameMap.UserPlaylists, value.state);
          }
        },
        removeItem: async () => {
          await window.electron.clearStore(StoreNameMap.UserPlaylists);
        },
      },
    },
  ),
);
