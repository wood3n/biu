import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";

import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  useDisclosure,
  addToast,
} from "@heroui/react";
import {
  RiEdit2Line,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiMoreLine,
  RiPlayFill,
  RiPlayListAddLine,
  RiRefreshLine,
  RiStarLine,
  RiStarOffLine,
  RiTeamLine,
} from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import type { BBPMember, BBPTrack } from "@/service/bbp-types";

import { glassMenuClassName } from "@/common/constants/glass";
import { bbpTracksToPlayItems } from "@/common/utils/bbp-track";
import { openBiliVideoLink } from "@/common/utils/url";
import { type ContextMenuItem } from "@/components/context-menu";
import Empty from "@/components/empty";
import FavoritesEditModal from "@/components/favorites-edit-modal";
import IconButton from "@/components/icon-button";
import Image from "@/components/image";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import SearchWithSort from "@/components/search-with-sort";
import VirtualPageList from "@/components/virtual-page-list";
import { getWebInterfaceView } from "@/service/web-interface-view";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { useModalStore } from "@/store/modal";
import { useMusicFavStore } from "@/store/music-fav";
import { usePlayList, type PlayData } from "@/store/play-list";
import { useSettings } from "@/store/settings";

/** 将 BBPlayer 曲目转换为 PlayData（用于收藏弹窗的 playData） */
const bbpTrackToPlayData = (track: BBPTrack): PlayData => ({
  id: track.unique_key,
  type: "mv",
  bvid: track.bilibili_bvid,
  cid: track.bilibili_cid,
  title: track.title,
  cover: track.cover_url ?? undefined,
  ownerName: track.artist_name,
  duration: track.duration,
});

const BBPFavorites = () => {
  const { id: playlistId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const role = (searchParams.get("role") as "owner" | "editor" | "subscriber" | null) ?? "subscriber";

  const displayMode = useSettings(state => state.displayMode);
  const bbpToken = useBBPTokenStore(state => state.token);
  const bbpAccount = useBBPTokenStore(state => state.account);

  const playlistCache = useBBPPlaylistStore(state => state.playlistCache);
  const syncPlaylist = useBBPPlaylistStore(state => state.syncPlaylist);
  const removeTrack = useBBPPlaylistStore(state => state.removeTrack);
  const fetchMembers = useBBPPlaylistStore(state => state.fetchMembers);
  const fetchInviteCode = useBBPPlaylistStore(state => state.fetchInviteCode);
  const rotateInviteCode = useBBPPlaylistStore(state => state.rotateInviteCode);

  const [loading, setLoading] = useState(false);
  const [playCountMap, setPlayCountMap] = useState<Record<string, number>>({});
  const [pubdateMap, setPubdateMap] = useState<Record<string, number>>({});
  const [keyword, setKeyword] = useState<string>("");
  const [order, setOrder] = useState("mtime");
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const [members, setMembers] = useState<BBPMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const scrollRef = useRef<ScrollRefObject>(null);

  const cache = playlistId ? playlistCache[playlistId] : undefined;
  const tracks = useMemo(() => cache?.tracks ?? [], [cache?.tracks]);
  const metadata = cache?.metadata;

  useEffect(() => {
    if (!playlistId || !bbpToken) return;
    let canceled = false;
    // 从 store 实时读取，避免 persist 异步水合导致的时序问题
    const cachedTracks = useBBPPlaylistStore.getState().playlistCache[playlistId]?.tracks ?? [];
    // 有本地缓存：立即渲染，后台静默同步刷新（不阻塞 UI、不显示骨架屏）
    if (cachedTracks.length) {
      void (async () => {
        try {
          await syncPlaylist(playlistId);
        } catch (error) {
          if (!canceled) {
            addToast({ title: "获取歌单内容失败", color: "danger" });
            console.error(error);
          }
        }
      })();
      return () => {
        canceled = true;
      };
    }
    // 无缓存：显示加载态，等服务器数据
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

  // 本地过滤 + 排序后的曲目列表
  const displayTracks = useMemo(() => {
    let list = tracks;
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(t => t.title.toLowerCase().includes(kw) || (t.artist_name?.toLowerCase() ?? "").includes(kw));
    }
    if (order === "view") {
      list = [...list].sort((a, b) => {
        const va = a.bilibili_bvid ? (playCountMap[a.bilibili_bvid] ?? -1) : -1;
        const vb = b.bilibili_bvid ? (playCountMap[b.bilibili_bvid] ?? -1) : -1;
        return vb - va;
      });
    } else if (order === "pubtime") {
      list = [...list].sort((a, b) => {
        const pa = a.bilibili_bvid ? (pubdateMap[a.bilibili_bvid] ?? -1) : -1;
        const pb = b.bilibili_bvid ? (pubdateMap[b.bilibili_bvid] ?? -1) : -1;
        return pb - pa;
      });
    }
    // "mtime" 与默认：维持 sort_key DESC（手动顺序）
    return list;
  }, [tracks, keyword, order, playCountMap, pubdateMap]);

  const playItems = useMemo(() => bbpTracksToPlayItems(displayTracks), [displayTracks]);

  // 批量获取 B站播放量
  useEffect(() => {
    if (!tracks.length) return;
    let canceled = false;
    const bvids = tracks.map(t => t.bilibili_bvid).filter(Boolean) as string[];
    const uniqueBvids = [...new Set(bvids)];
    if (!uniqueBvids.length) return;
    const CONCURRENCY = 8;
    const BATCH_SIZE = Math.ceil(uniqueBvids.length / CONCURRENCY);
    const batches: string[][] = [];
    for (let i = 0; i < uniqueBvids.length; i += BATCH_SIZE) {
      batches.push(uniqueBvids.slice(i, i + BATCH_SIZE));
    }
    (async () => {
      const results = await Promise.all(
        batches.map(async batch => {
          const map: Record<string, number> = {};
          const pdateMap: Record<string, number> = {};
          for (const bvid of batch) {
            try {
              const res = await getWebInterfaceView({ bvid });
              if (res.code === 0 && res.data?.stat) {
                map[bvid] = res.data.stat.view;
                if (res.data.pubdate) {
                  pdateMap[bvid] = res.data.pubdate;
                }
              }
            } catch {
              // 忽略单个失败
            }
          }
          return { viewMap: map, pubdateMap: pdateMap };
        }),
      );
      if (canceled) return;
      const merged: Record<string, number> = {};
      const mergedPubdate: Record<string, number> = {};
      for (const r of results) {
        Object.assign(merged, r.viewMap);
        Object.assign(mergedPubdate, r.pubdateMap);
      }
      setPlayCountMap(merged);
      setPubdateMap(mergedPubdate);
    })();
    return () => {
      canceled = true;
    };
  }, [tracks]);

  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  // 通过 URL hash #members 自动打开成员管理弹窗
  useEffect(() => {
    if (!playlistId || !bbpToken) return;
    if (location.hash !== "#members") return;
    setMembersModalOpen(true);
    // 清除 hash，避免刷新时重复打开（用 navigate 保持 react-router 状态一致）
    navigate(location.pathname + location.search, { replace: true });
  }, [location.hash, location.pathname, location.search, playlistId, bbpToken, navigate]);

  // 打开成员管理弹窗时加载成员和邀请码
  useEffect(() => {
    if (!membersModalOpen || !playlistId) return;
    let canceled = false;
    setMembersLoading(true);
    setInviteLoading(true);
    (async () => {
      try {
        const list = await fetchMembers(playlistId);
        if (!canceled) setMembers(list);
      } catch {
        if (!canceled) addToast({ title: "获取成员列表失败", color: "danger" });
      } finally {
        if (!canceled) setMembersLoading(false);
      }
    })();
    if (isOwner) {
      (async () => {
        try {
          const code = await fetchInviteCode(playlistId);
          if (!canceled) setInviteCode(code);
        } catch {
          // 忽略
        } finally {
          if (!canceled) setInviteLoading(false);
        }
      })();
    }
    return () => {
      canceled = true;
    };
  }, [membersModalOpen, playlistId, fetchMembers, fetchInviteCode, isOwner]);

  const handleRotateInviteCode = useCallback(async () => {
    if (!playlistId) return;
    setRotating(true);
    try {
      const newCode = await rotateInviteCode(playlistId);
      setInviteCode(newCode);
      addToast({ title: "邀请码已更新", color: "success" });
    } catch {
      addToast({ title: "更新邀请码失败", color: "danger" });
    } finally {
      setRotating(false);
    }
  }, [playlistId, rotateInviteCode]);

  const handleCopyInviteCode = useCallback(() => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    addToast({ title: "邀请码已复制", color: "success" });
  }, [inviteCode]);

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

  const handleRefresh = useCallback(() => {
    if (!playlistId || !bbpToken) return;
    setLoading(true);
    syncPlaylist(playlistId)
      .catch(() => addToast({ title: "刷新失败", color: "danger" }))
      .finally(() => setLoading(false));
  }, [playlistId, bbpToken, syncPlaylist]);

  const handleDownloadAll = useCallback(
    async (fileType: MediaDownloadOutputFileType) => {
      const downloadable = tracks.filter(t => t.bilibili_bvid);
      if (!downloadable.length) {
        addToast({ title: "没有可下载的内容", color: "warning" });
        return;
      }
      await window.electron.addMediaDownloadTaskList(
        downloadable.map(t => ({
          outputFileType: fileType,
          bvid: t.bilibili_bvid,
          title: t.title,
          cover: t.cover_url ?? undefined,
        })),
      );
      addToast({ title: "下载任务已添加", color: "success" });
    },
    [tracks],
  );

  const handleItemPress = useCallback(
    (trackIndex: number) => {
      const item = playItems[trackIndex];
      if (!item) return;
      usePlayList.getState().play(item);
    },
    [playItems],
  );

  const handleMenuAction = useCallback(
    (key: string, trackKey: string, trackIndex: number) => {
      const item = playItems[trackIndex];
      const track = displayTracks[trackIndex];
      if (!item) return;
      switch (key) {
        case "favorite": {
          if (!track?.bilibili_bvid) return;
          // B站收藏夹流程需要 aid，先获取一次
          void (async () => {
            let rid = "";
            try {
              const view = await getWebInterfaceView({ bvid: track.bilibili_bvid });
              if (view.code === 0 && view.data?.aid) {
                rid = String(view.data.aid);
              }
            } catch {
              // 获取 aid 失败则仅走 BBP 歌单流程
            }
            useModalStore.getState().onOpenFavSelectModal({
              title: track.title,
              rid,
              playData: bbpTrackToPlayData(track),
            });
          })();
          break;
        }
        case "play-next":
          usePlayList.getState().addToNext(item);
          break;
        case "add-to-playlist":
          usePlayList.getState().addList([item]);
          addToast({ title: "已添加到播放列表", color: "success" });
          break;
        case "download-audio":
          if (!track) return;
          void window.electron.addMediaDownloadTask({
            outputFileType: "audio",
            title: track.title,
            cover: track.cover_url ?? undefined,
            bvid: track.bilibili_bvid,
            cid: track.bilibili_cid,
          });
          addToast({ title: "已添加下载任务", color: "success" });
          break;
        case "download-video":
          if (!track) return;
          void window.electron.addMediaDownloadTask({
            outputFileType: "video",
            title: track.title,
            cover: track.cover_url ?? undefined,
            bvid: track.bilibili_bvid,
            cid: track.bilibili_cid,
          });
          addToast({ title: "已添加下载任务", color: "success" });
          break;
        case "bililink":
          if (!track) return;
          openBiliVideoLink({ type: "mv", bvid: track.bilibili_bvid });
          break;
        case "cancelFavorite": {
          if (!track) return;
          useModalStore.getState().onOpenConfirmModal({
            title: `确认取消收藏${track.title}？`,
            type: "danger",
            onConfirm: async () => {
              try {
                await removeTrack(playlistId!, trackKey);
                addToast({ title: "已取消收藏", color: "success" });
                useMusicFavStore.getState().refreshIsFav();
                return true;
              } catch {
                addToast({ title: "移除失败", color: "danger" });
                return false;
              }
            },
          });
          break;
        }
        default:
          break;
      }
    },
    [playItems, displayTracks, playlistId, removeTrack],
  );

  // 菜单："移动"打开收藏弹窗，"取消收藏"仅可编辑歌单显示
  const trackMenus = useMemo<ContextMenuItem[]>(() => {
    const menus: ContextMenuItem[] = [
      {
        key: "favorite",
        label: "移动",
        icon: <RiStarLine size={18} />,
      },
      {
        key: "cancelFavorite",
        label: "取消收藏",
        icon: <RiStarOffLine size={18} />,
        color: "danger",
        className: "text-danger",
        hidden: !canEdit,
      },
      { key: "play-next", label: "下一首播放", icon: <RiPlayFill size={18} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "download-audio", label: "下载音频", icon: <RiFileMusicLine size={18} /> },
      { key: "download-video", label: "下载视频", icon: <RiFileVideoLine size={18} /> },
      { key: "bililink", label: "在 B 站打开", icon: <RiExternalLinkLine size={18} /> },
    ];
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
        <div className="group relative flex-none">
          {loading && !metadata ? (
            <Skeleton className="h-[168px] w-[168px] rounded-md" />
          ) : (
            <>
              <Image
                radius="md"
                src={metadata?.cover_url}
                alt={metadata?.title}
                width={168}
                height={168}
                className={!metadata?.cover_url ? "border-content3 border" : undefined}
              />
              {canEdit && (
                <div
                  className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={onEditOpen}
                  onKeyDown={e => e.key === "Enter" && onEditOpen()}
                  role="button"
                  tabIndex={0}
                  aria-label="修改歌单"
                >
                  <div className="flex flex-col items-center gap-2">
                    <RiEdit2Line size={28} />
                    <span className="text-sm">修改</span>
                  </div>
                </div>
              )}
            </>
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
              <div className="flex flex-col space-y-1">
                <div className="text-foreground-400 flex items-center space-x-1 text-sm">
                  <span>BBPlayer 共享歌单</span>
                  <span>•</span>
                  <span>{roleLabel}</span>
                  <span>•</span>
                  <span>{tracks.length} 首</span>
                </div>
                {bbpAccount && <div className="text-foreground-400 text-sm">创建者：{bbpAccount.name}</div>}
                {playlistId && (
                  <div className="-ml-2 flex items-center gap-2">
                    <span className="bg-default-100 dark:bg-default-50 rounded-small text-foreground-400 px-2 py-0.5 text-xs">
                      ID: {playlistId}
                    </span>
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
              </div>
            </>
          )}
        </div>
      </div>

      {/* 操作栏 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            color="primary"
            startContent={<RiPlayFill size={22} />}
            onPress={handlePlayAll}
            className="text-white"
          >
            播放全部
          </Button>
          <IconButton size="md" variant="flat" tooltip="添加到播放列表" onPress={handleAddAllToPlaylist}>
            <RiPlayListAddLine size={18} />
          </IconButton>
          {canEdit && (
            <IconButton size="md" variant="flat" tooltip="管理成员" onPress={() => setMembersModalOpen(true)}>
              <RiTeamLine size={18} />
            </IconButton>
          )}
          <IconButton size="md" variant="flat" tooltip="刷新" onPress={handleRefresh} isDisabled={loading}>
            <RiRefreshLine size={18} className={loading ? "animate-spin" : undefined} />
          </IconButton>
          <Dropdown
            disableAnimation
            placement="bottom-start"
            shouldBlockScroll={false}
            trigger="press"
            classNames={{ content: twMerge(glassMenuClassName, "min-w-[120px]") }}
          >
            <DropdownTrigger>
              <IconButton size="md" variant="flat" tooltip="更多">
                <RiMoreLine size={18} />
              </IconButton>
            </DropdownTrigger>
            <DropdownMenu aria-label="歌单操作" variant="flat">
              <DropdownItem
                key="download-audio"
                startContent={<RiFileMusicLine size={18} />}
                onPress={() => handleDownloadAll("audio")}
                isDisabled={!tracks.length}
              >
                下载全部音频
              </DropdownItem>
              <DropdownItem
                key="download-video"
                startContent={<RiFileVideoLine size={18} />}
                onPress={() => handleDownloadAll("video")}
                isDisabled={!tracks.length}
              >
                下载全部视频
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <SearchWithSort
          onKeywordSearch={setKeyword}
          order={order}
          onOrderChange={setOrder}
          orderOptions={[
            { key: "mtime", label: "默认排序" },
            { key: "view", label: "最多播放" },
            { key: "pubtime", label: "最近投稿" },
          ]}
        />
      </div>

      {/* 曲目列表 */}
      <div className="w-full">
        <MusicListHeader timeTitle="时长" hidePubTime />
        {!loading && displayTracks.length === 0 ? (
          <Empty title={tracks.length === 0 ? "歌单暂无曲目" : "未找到匹配的曲目"} />
        ) : (
          <VirtualPageList
            items={displayTracks}
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
                playCount={track.bilibili_bvid ? playCountMap[track.bilibili_bvid] : undefined}
                hidePubTime
                onPress={() => handleItemPress(index)}
                menus={trackMenus}
                onMenuAction={key => handleMenuAction(key, track.unique_key, index)}
              />
            )}
          />
        )}
      </div>

      {/* 成员管理弹窗 */}
      <Modal
        radius="md"
        size="md"
        scrollBehavior="inside"
        isOpen={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        disableAnimation
      >
        <ModalContent>
          <ModalHeader>管理成员</ModalHeader>
          <ModalBody className="pb-6">
            {/* 成员列表 */}
            <div className="space-y-1">
              {membersLoading ? (
                <div className="text-foreground-400 py-4 text-center text-sm">加载中...</div>
              ) : members.length === 0 ? (
                <div className="text-foreground-400 py-4 text-center text-sm">暂无成员</div>
              ) : (
                members.map(member => (
                  <div key={member.account_id} className="bg-default-100/50 flex items-center gap-3 rounded-md p-2">
                    <Image
                      src={member.avatar_url ?? undefined}
                      alt={member.name}
                      width={36}
                      height={36}
                      radius="full"
                      className="flex-none"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{member.name}</div>
                      <div className="text-foreground-400 text-xs">{member.account_id}</div>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={member.role === "owner" ? "warning" : member.role === "editor" ? "primary" : "default"}
                    >
                      {member.role === "owner" ? "创建者" : member.role === "editor" ? "编辑者" : "订阅者"}
                    </Chip>
                  </div>
                ))
              )}
            </div>

            {/* 邀请码区域（仅 owner 可见） */}
            {isOwner && (
              <div className="border-content3/20 mt-4 border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">编辑者邀请码</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className="h-7 min-h-7 w-7 min-w-7"
                      onPress={handleRotateInviteCode}
                      isLoading={rotating}
                      title="重置邀请码"
                    >
                      {!rotating && <RiRefreshLine size={14} />}
                    </Button>
                  </div>
                </div>
                {inviteLoading ? (
                  <div className="text-foreground-400 py-2 text-sm">加载中...</div>
                ) : inviteCode ? (
                  <div className="flex items-center gap-2">
                    <code className="bg-default-100 dark:bg-default-50 rounded-small px-3 py-1.5 font-mono text-sm">
                      {inviteCode}
                    </code>
                    <Button
                      size="sm"
                      variant="flat"
                      className="h-7 min-h-7 px-2"
                      startContent={<RiFileCopyLine size={14} />}
                      onPress={handleCopyInviteCode}
                    >
                      复制
                    </Button>
                  </div>
                ) : (
                  <div className="text-foreground-400 py-2 text-sm">未设置邀请码</div>
                )}
                <p className="text-foreground-400 mt-2 text-xs leading-relaxed">
                  将邀请码分享给其他用户，他们在订阅歌单时输入邀请码即可成为编辑者，拥有添加和移除曲目的权限。
                </p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 编辑歌单弹窗（仅可编辑角色） */}
      {canEdit && <FavoritesEditModal bbpId={playlistId} isOpen={isEditOpen} onOpenChange={onEditOpenChange} />}
    </ScrollContainer>
  );
};

export default BBPFavorites;
