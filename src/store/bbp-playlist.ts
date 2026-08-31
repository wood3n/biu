import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BBPChange, BBPMember, BBPPlaylistSummary, BBPTrack, BBPTrackInput } from "@/service/bbp-types";

import { bbpMePlaylists } from "@/service/bbp-me-playlists";
import { bbpPlaylistChangesPull } from "@/service/bbp-playlist-changes-pull";
import { bbpPlaylistChangesSubmit } from "@/service/bbp-playlist-changes-submit";
import { bbpPlaylistCreate } from "@/service/bbp-playlist-create";
import { bbpPlaylistDelete } from "@/service/bbp-playlist-delete";
import { bbpPlaylistLeave } from "@/service/bbp-playlist-leave";
import { bbpPlaylistSubscribe } from "@/service/bbp-playlist-subscribe";

interface BBPPlaylistCacheEntry {
  lastSyncAt: number;
  tracks: BBPTrack[];
  metadata: { title: string; description: string; cover_url: string } | null;
  members: BBPMember[];
}

interface BBPPlaylistState {
  /** 我参与的所有歌单 */
  playlists: BBPPlaylistSummary[];
  /** 歌单本地缓存：ID → 同步状态 + 曲目 */
  playlistCache: Record<string, BBPPlaylistCacheEntry>;
  /** 加载状态 */
  loading: boolean;
  /** 上次拉取歌单列表的时间戳（ms），用于判断是否需要重新拉取 */
  lastFetchAt: number;
}

interface BBPPlaylistAction {
  /** 拉取歌单列表 */
  fetchPlaylists: () => Promise<void>;
  /** 如果缓存过期则拉取歌单列表（默认 5 分钟） */
  fetchPlaylistsIfStale: (maxAgeMs?: number) => Promise<void>;
  /** 增量同步某歌单曲目（since=0 为全量） */
  syncPlaylist: (playlistId: string) => Promise<void>;
  /** 创建歌单 */
  createPlaylist: (title: string, tracks?: BBPTrackInput[]) => Promise<string | undefined>;
  /** 添加曲目到歌单（upsert） */
  addTrack: (playlistId: string, track: BBPTrackInput) => Promise<void>;
  /** 从歌单移除曲目 */
  removeTrack: (playlistId: string, trackUniqueKey: string) => Promise<void>;
  /** 重排曲目顺序 */
  reorderTrack: (playlistId: string, trackUniqueKey: string, newSortKey: string) => Promise<void>;
  /** 订阅歌单 */
  subscribePlaylist: (playlistId: string, inviteCode?: string) => Promise<void>;
  /** 退出歌单 */
  leavePlaylist: (playlistId: string) => Promise<void>;
  /** 删除歌单（owner） */
  deletePlaylist: (playlistId: string) => Promise<void>;
  /** 获取缓存中的曲目列表 */
  getCachedTracks: (playlistId: string) => BBPTrack[];
  /** 获取包含指定 bvid 的歌单 ID 列表（基于本地缓存） */
  getPlaylistIdsByBvid: (bvid: string) => string[];
  /** 清空所有缓存 */
  clearCache: () => void;
}

export const useBBPPlaylistStore = create<BBPPlaylistState & BBPPlaylistAction>()(
  persist(
    (set, get) => ({
      playlists: [],
      playlistCache: {},
      loading: false,
      lastFetchAt: 0,

      fetchPlaylists: async () => {
        set(() => ({ loading: true }));

        try {
          const res = await bbpMePlaylists();

          set(() => ({
            playlists: res.playlists ?? [],
            lastFetchAt: Date.now(),
          }));
        } finally {
          set(() => ({ loading: false }));
        }
      },

      fetchPlaylistsIfStale: async (maxAgeMs = 5 * 60 * 1000) => {
        const { lastFetchAt, playlists } = get();
        if (playlists.length > 0 && Date.now() - lastFetchAt < maxAgeMs) {
          return;
        }
        await get().fetchPlaylists();
      },

      syncPlaylist: async playlistId => {
        const cache = get().playlistCache[playlistId];
        const lastSyncAt = cache?.lastSyncAt ?? 0;

        const res = await bbpPlaylistChangesPull({ id: playlistId, since: lastSyncAt });

        set(state => {
          const prev = state.playlistCache[playlistId];
          const prevTracks = prev?.tracks ?? [];
          const trackMap = new Map(prevTracks.map(track => [track.unique_key, track]));

          for (const change of res.tracks ?? []) {
            if (change.op === "upsert" && change.track) {
              trackMap.set(change.track.unique_key, change.track);
            } else if (change.op === "delete" && change.track_unique_key) {
              trackMap.delete(change.track_unique_key);
            }
          }

          const nextTracks = [...trackMap.values()].sort((a, b) => a.sort_key.localeCompare(b.sort_key));

          const nextEntry: BBPPlaylistCacheEntry = {
            lastSyncAt: res.server_time,
            tracks: nextTracks,
            metadata: res.metadata ?? prev?.metadata ?? null,
            members: res.members ?? prev?.members ?? [],
          };

          return {
            playlistCache: {
              ...state.playlistCache,
              [playlistId]: nextEntry,
            },
          };
        });
      },

      createPlaylist: async (title, tracks) => {
        const res = await bbpPlaylistCreate({
          title,
          tracks: tracks?.map((track, index) => ({
            track,
            sort_key: String(index),
          })),
        });

        const newPlaylist: BBPPlaylistSummary = {
          id: res.playlist.id,
          title: res.playlist.title,
          description: res.playlist.description,
          coverUrl: res.playlist.cover_url,
          updatedAt: Number(new Date(res.playlist.updated_at)),
          role: "owner",
          joinedAt: Number(new Date(res.playlist.created_at)),
        };

        set(state => ({
          playlists: [newPlaylist, ...state.playlists],
        }));

        return res.playlist.id;
      },

      addTrack: async (playlistId, track) => {
        const cache = get().playlistCache[playlistId];
        const trackCount = cache?.tracks.length ?? 0;
        const sortKey = String(trackCount).padStart(4, "0");
        const change: BBPChange = {
          op: "upsert",
          track,
          sort_key: sortKey,
          operation_at: Date.now(),
        };

        await bbpPlaylistChangesSubmit({ id: playlistId, changes: [change] });

        // 乐观更新：直接将曲目写入本地缓存，不依赖服务器同步延迟
        set(state => {
          const prev = state.playlistCache[playlistId];
          const prevTracks = prev?.tracks ?? [];
          const trackMap = new Map(prevTracks.map(t => [t.unique_key, t]));
          // 写入完整 BBPTrack 对象（从 BBPTrackInput 扩展）
          const fullTrack: BBPTrack = {
            unique_key: track.unique_key,
            title: track.title,
            artist_name: track.artist_name,
            artist_id: track.artist_id ?? null,
            cover_url: track.cover_url ?? null,
            duration: track.duration ?? 0,
            bilibili_bvid: track.bilibili_bvid,
            bilibili_cid: track.bilibili_cid,
            sort_key: sortKey,
          };
          trackMap.set(track.unique_key, fullTrack);
          const nextTracks = [...trackMap.values()].sort((a, b) => a.sort_key.localeCompare(b.sort_key));
          return {
            playlistCache: {
              ...state.playlistCache,
              [playlistId]: {
                lastSyncAt: prev?.lastSyncAt ?? 0,
                tracks: nextTracks,
                metadata: prev?.metadata ?? null,
                members: prev?.members ?? [],
              },
            },
          };
        });

        // 后台同步，获取服务器最新状态（不阻塞调用方）
        void get().syncPlaylist(playlistId);
      },

      removeTrack: async (playlistId, trackUniqueKey) => {
        const change: BBPChange = {
          op: "remove",
          track_unique_key: trackUniqueKey,
          operation_at: Date.now(),
        };

        await bbpPlaylistChangesSubmit({ id: playlistId, changes: [change] });

        // 乐观更新：直接从本地缓存移除曲目
        set(state => {
          const prev = state.playlistCache[playlistId];
          const prevTracks = prev?.tracks ?? [];
          const nextTracks = prevTracks.filter(t => t.unique_key !== trackUniqueKey);
          return {
            playlistCache: {
              ...state.playlistCache,
              [playlistId]: {
                lastSyncAt: prev?.lastSyncAt ?? 0,
                tracks: nextTracks,
                metadata: prev?.metadata ?? null,
                members: prev?.members ?? [],
              },
            },
          };
        });

        // 后台同步，获取服务器最新状态（不阻塞调用方）
        void get().syncPlaylist(playlistId);
      },

      reorderTrack: async (playlistId, trackUniqueKey, newSortKey) => {
        const change: BBPChange = {
          op: "reorder",
          track_unique_key: trackUniqueKey,
          sort_key: newSortKey,
          operation_at: Date.now(),
        };

        await bbpPlaylistChangesSubmit({ id: playlistId, changes: [change] });

        await get().syncPlaylist(playlistId);
      },

      subscribePlaylist: async (playlistId, inviteCode) => {
        await bbpPlaylistSubscribe({ id: playlistId, invite_code: inviteCode });

        await get().fetchPlaylists();
      },

      leavePlaylist: async playlistId => {
        await bbpPlaylistLeave({ id: playlistId });

        set(state => ({
          playlists: state.playlists.filter(item => item.id !== playlistId),
          playlistCache: Object.fromEntries(Object.entries(state.playlistCache).filter(([id]) => id !== playlistId)),
        }));
      },

      deletePlaylist: async playlistId => {
        await bbpPlaylistDelete({ id: playlistId });

        set(state => {
          const { [playlistId]: _, ...restCache } = state.playlistCache; // eslint-disable-line @typescript-eslint/no-unused-vars

          return {
            playlists: state.playlists.filter(item => item.id !== playlistId),
            playlistCache: restCache,
          };
        });
      },

      getCachedTracks: playlistId => {
        return get().playlistCache[playlistId]?.tracks ?? [];
      },

      getPlaylistIdsByBvid: bvid => {
        const { playlistCache } = get();
        return Object.entries(playlistCache)
          .filter(([, entry]) => entry.tracks.some(track => track.bilibili_bvid === bvid))
          .map(([id]) => id);
      },

      clearCache: () =>
        set(() => ({
          playlists: [],
          playlistCache: {},
          lastFetchAt: 0,
        })),
    }),
    {
      name: "bbp-playlist-cache",
      partialize: state => ({
        playlists: state.playlists,
        playlistCache: state.playlistCache,
        lastFetchAt: state.lastFetchAt,
      }),
    },
  ),
);
