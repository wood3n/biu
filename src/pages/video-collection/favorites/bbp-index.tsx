import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";

import { Button, Skeleton, addToast } from "@heroui/react";
import { RiFileCopyLine, RiPlayFill, RiPlayListAddLine } from "@remixicon/react";

import { bbpTracksToPlayItems } from "@/common/utils/bbp-track";
import { type ContextMenuItem } from "@/components/context-menu";
import Empty from "@/components/empty";
import Image from "@/components/image";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import VirtualPageList from "@/components/virtual-page-list";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const BBPFavorites = () => {
  const { id: playlistId } = useParams();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "owner" | "editor" | "subscriber" | null) ?? "subscriber";

  const displayMode = useSettings(state => state.displayMode);
  const bbpToken = useBBPTokenStore(state => state.token);
  const bbpAccount = useBBPTokenStore(state => state.account);

  const playlistCache = useBBPPlaylistStore(state => state.playlistCache);
  const syncPlaylist = useBBPPlaylistStore(state => state.syncPlaylist);
  const removeTrack = useBBPPlaylistStore(state => state.removeTrack);

  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollRefObject>(null);

  const cache = playlistId ? playlistCache[playlistId] : undefined;
  const tracks = useMemo(() => cache?.tracks ?? [], [cache?.tracks]);
  const metadata = cache?.metadata;

  useEffect(() => {
    if (!playlistId || !bbpToken) return;
    let canceled = false;
    setLoading(true);
    (async () => {
      try {
        await syncPlaylist(playlistId);
      } catch (error) {
        if (!canceled) {
          addToast({ title: "获取歌单内容失败", color: "danger" });
          console.error(error);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [playlistId, bbpToken, syncPlaylist]);

  const playItems = useMemo(() => bbpTracksToPlayItems(tracks), [tracks]);

  const canEdit = role === "owner" || role === "editor";

  const handlePlayAll = useCallback(() => {
    if (!playItems.length) {
      addToast({ title: "歌单为空", color: "warning" });
      return;
    }
    usePlayList.getState().playList(playItems);
  }, [playItems]);

  const handleAddAllToPlaylist = useCallback(() => {
    if (!playItems.length) {
      addToast({ title: "歌单为空", color: "warning" });
      return;
    }
    usePlayList.getState().addList(playItems);
    addToast({ title: `已添加 ${playItems.length} 首到播放列表`, color: "success" });
  }, [playItems]);

  const handleItemPress = useCallback(
    (trackIndex: number) => {
      const item = playItems[trackIndex];
      if (!item) return;
      usePlayList.getState().play(item);
    },
    [playItems],
  );

  const handleRemoveTrack = useCallback(
    async (trackKey: string) => {
      if (!playlistId) return;
      try {
        await removeTrack(playlistId, trackKey);
        addToast({ title: "已从歌单移除", color: "success" });
      } catch {
        addToast({ title: "移除失败", color: "danger" });
      }
    },
    [playlistId, removeTrack],
  );

  const handleMenuAction = useCallback(
    (key: string, trackKey: string, trackIndex: number) => {
      const item = playItems[trackIndex];
      if (!item) return;
      switch (key) {
        case "play-next":
          usePlayList.getState().addToNext(item);
          break;
        case "add-to-playlist":
          usePlayList.getState().addList([item]);
          addToast({ title: "已添加到播放列表", color: "success" });
          break;
        case "remove":
          handleRemoveTrack(trackKey);
          break;
        default:
          break;
      }
    },
    [playItems, handleRemoveTrack],
  );

  const trackMenus = useMemo<ContextMenuItem[]>(() => {
    const menus: ContextMenuItem[] = [
      { key: "play-next", label: "下一首播放", icon: <RiPlayFill size={18} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
    ];
    if (canEdit) {
      menus.push({ key: "remove", label: "从歌单移除", color: "danger", className: "text-danger" });
    }
    return menus;
  }, [canEdit]);

  if (!bbpToken) {
    return (
      <ScrollContainer className="h-full w-full px-4 pb-6">
        <Empty title="请先登录 BBPlayer 账号" />
      </ScrollContainer>
    );
  }

  const roleLabel = role === "owner" ? "创建者" : role === "editor" ? "编辑者" : "订阅者";

  return (
    <ScrollContainer enableBackToTop ref={scrollRef} resetOnChange={playlistId} className="h-full w-full px-4 pb-6">
      {/* 页面头部 */}
      <div className="mb-4 flex space-x-4">
        <div className="flex-none">
          {loading && !metadata ? (
            <Skeleton className="h-[168px] w-[200px] rounded-md" />
          ) : (
            <Image
              radius="md"
              src={metadata?.cover_url}
              alt={metadata?.title}
              width={200}
              height={168}
              className={!metadata?.cover_url ? "border-content3 border" : undefined}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start space-y-4">
          {loading && !metadata ? (
            <>
              <Skeleton className="h-[24px] w-[200px] rounded-md" />
              <Skeleton className="h-[16px] w-[200px] rounded-md" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{metadata?.title ?? "未知歌单"}</h1>
              {Boolean(metadata?.description) && (
                <p className="text-foreground-400 line-clamp-1 text-sm">{metadata?.description}</p>
              )}
              <div className="text-foreground-400 flex items-center space-x-1 text-sm">
                <span>BBPlayer 共享歌单</span>
                <span>•</span>
                <span>{roleLabel}</span>
                <span>•</span>
                <span>{tracks.length} 首</span>
              </div>
              {bbpAccount && <div className="text-foreground-400 text-sm">创建者：{bbpAccount.name}</div>}
              {playlistId && (
                <div className="flex items-center gap-2">
                  <code className="bg-default-100 dark:bg-default-50 rounded-small text-foreground-400 px-2 py-0.5 text-xs">
                    ID: {playlistId}
                  </code>
                  <Button
                    size="sm"
                    variant="flat"
                    className="h-6 min-h-6 px-2"
                    startContent={<RiFileCopyLine size={14} />}
                    onPress={() => {
                      const shareUrl = `https://be.bbplayer.roitium.com/playlists/${playlistId}/preview`;
                      navigator.clipboard.writeText(shareUrl);
                      addToast({ title: "分享链接已复制", color: "success" });
                    }}
                  >
                    复制分享链接
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 操作栏 */}
      <div className="mb-4 flex items-center space-x-2">
        <Button color="primary" startContent={<RiPlayFill size={22} />} onPress={handlePlayAll} className="text-white">
          播放全部
        </Button>
        <Button variant="flat" onPress={handleAddAllToPlaylist}>
          <RiPlayListAddLine size={18} />
          添加到播放列表
        </Button>
      </div>

      {/* 曲目列表 */}
      {!loading && tracks.length === 0 ? (
        <Empty title="歌单暂无曲目" />
      ) : (
        <div className="w-full">
          <MusicListHeader timeTitle="时长" />
          <VirtualPageList
            items={tracks}
            hasMore={false}
            loading={loading}
            getScrollElement={() =>
              (scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null
            }
            rowHeight={displayMode === "compact" ? 36 : 64}
            renderItem={(track, index) => (
              <MusicListItem
                key={track.unique_key}
                index={index + 1}
                title={track.title}
                type="mv"
                bvid={track.bilibili_bvid}
                cover={track.cover_url ?? undefined}
                upName={track.artist_name}
                duration={track.duration}
                hidePubTime
                onPress={() => handleItemPress(index)}
                menus={trackMenus}
                onMenuAction={key => handleMenuAction(key, track.unique_key, index)}
              />
            )}
          />
        </div>
      )}
    </ScrollContainer>
  );
};

export default BBPFavorites;
