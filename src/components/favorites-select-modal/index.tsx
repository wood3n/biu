import React, { useEffect, useMemo, useRef, useState } from "react";

import { addToast, Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiMusic2Line } from "@remixicon/react";
import { useRequest } from "ahooks";

import { getFavFolderCreatedListAll } from "@/service/fav-folder-created-list-all";
import { postFavFolderDeal } from "@/service/fav-folder-deal";
import { getAudioCreatedFavList } from "@/service/medialist-gateway-base-created";
import { postCollResourceDeal } from "@/service/medialist-gateway-coll-resource-deal";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { type FavSelectModalData, useModalStore } from "@/store/modal";
import { useMusicFavStore } from "@/store/music-fav";
import { useUser } from "@/store/user";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

const hasSameIds = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const set2 = new Set(arr2);
  return arr1.every(item => set2.has(item));
};

/** 比较两组字符串 ID 是否完全一致（忽略顺序） */
const sameBBPSelection = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  const set2 = new Set(arr2);
  return arr1.every(item => set2.has(item));
};

/** 将视频的播放数据转换为 BBPlayer track input */
const playDataToBBPTrack = (playData: NonNullable<FavSelectModalData["playData"]>) => {
  if (!playData.bvid || !playData.cid) {
    return null;
  }
  return {
    unique_key: `bilibili::${playData.bvid}::${playData.cid}`,
    title: playData.title,
    artist_name: playData.ownerName ?? "",
    cover_url: playData.cover ?? "",
    duration: playData.duration,
    bilibili_bvid: playData.bvid,
    bilibili_cid: playData.cid,
  };
};

/** 将视频的播放数据转换为 BBPlayer track input */
const FavoritesSelectModal = () => {
  const user = useUser(s => s.user);
  const isFavSelectModalOpen = useModalStore(s => s.isFavSelectModalOpen);
  const onFavSelectModalOpenChange = useModalStore(s => s.onFavSelectModalOpenChange);
  const favSelectModalData = useModalStore(s => s.favSelectModalData);
  const { rid, type = 2, title, playData, onSuccess } = favSelectModalData || {};

  const bbpToken = useBBPTokenStore(s => s.token);
  const bbpPlaylists = useBBPPlaylistStore(s => s.playlists);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  /** 选中的 BBPlayer 歌单 ID（多选，与 B 站收藏夹可同时勾选） */
  const [selectedBBPIds, setSelectedBBPIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  /** 标记用户是否手动操作过 BBP 勾选，若手动操作过则异步同步不再覆盖 */
  const bbpTouchedRef = useRef(false);

  const prevSelectedRef = useRef<number[]>([]);
  /** 当前曲目已包含的 BBP 歌单 ID（本地缓存判断，用于默认勾选） */
  const bvidFavPlaylistIds = useMemo(
    () => (playData?.bvid ? useBBPPlaylistStore.getState().getPlaylistIdsByBvid(playData.bvid) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFavSelectModalOpen, playData?.bvid, bbpPlaylists],
  );

  useEffect(() => {
    if (!isFavSelectModalOpen) {
      setSelectedIds([]);
      setSelectedBBPIds([]);
      prevSelectedRef.current = [];
      bbpTouchedRef.current = false;
    } else {
      // 打开时：B站收藏夹已在 useRequest 中设置；BBP 歌单按缓存预勾选
      setSelectedBBPIds(bvidFavPlaylistIds);
      bbpTouchedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFavSelectModalOpen]);

  // 打开弹窗时同步 BBP 歌单列表与曲目缓存，保证默认勾选判断准确
  useEffect(() => {
    if (!isFavSelectModalOpen || !bbpToken) return;
    let canceled = false;
    (async () => {
      try {
        await useBBPPlaylistStore.getState().fetchPlaylistsIfStale();
        const { playlists } = useBBPPlaylistStore.getState();
        await Promise.allSettled(
          playlists
            .filter(p => p.role === "owner" || p.role === "editor")
            .map(p => useBBPPlaylistStore.getState().syncPlaylist(p.id)),
        );
        if (!canceled && !bbpTouchedRef.current) {
          // 同步完成后刷新预勾选，但仅当用户未手动操作过
          const favIds = playData?.bvid ? useBBPPlaylistStore.getState().getPlaylistIdsByBvid(playData.bvid) : [];
          setSelectedBBPIds(favIds);
        }
      } catch {
        // 同步失败不影响弹窗使用，仅预勾选可能不准
      }
    })();
    return () => {
      canceled = true;
    };
  }, [isFavSelectModalOpen, bbpToken, playData?.bvid]);

  const { data } = useRequest(
    async () => {
      if (!rid) return [];

      let list: any[] = [];
      if (type === 12) {
        const res = await getAudioCreatedFavList({
          rid: Number(rid),
          type: 12,
          up_mid: user?.mid as number,
          pn: 1,
          ps: 100,
        });
        list = res?.data?.list || [];
      } else {
        const res = await getFavFolderCreatedListAll({
          rid: Number(rid),
          type,
          up_mid: user?.mid as number,
        });
        list = res?.data?.list || [];
      }

      const selectedFavs = list.filter(item => item.fav_state === 1) || [];
      if (selectedFavs?.length) {
        prevSelectedRef.current = selectedFavs.map(item => item.id);
        setSelectedIds(prevSelectedRef.current);
      } else {
        prevSelectedRef.current = [];
        setSelectedIds([]);
      }

      return list;
    },
    {
      ready: Boolean(isFavSelectModalOpen && user?.mid && rid),
      refreshDeps: [isFavSelectModalOpen, rid],
    },
  );

  const toggle = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const toggleBBP = (id: string) => {
    bbpTouchedRef.current = true;
    setSelectedBBPIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleCancel = () => {
    onFavSelectModalOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!rid && selectedBBPIds.length === 0) return;

    setSubmitting(true);

    // 记录操作结果
    const results: string[] = [];
    let hasError = false;

    // ===== B站收藏夹流程 =====
    const prevSelectedFolderIds = data?.filter(item => item.fav_state === 1)?.map(item => item.id) || [];
    const delMediaIds = prevSelectedFolderIds.filter(id => !selectedIds.includes(id)).join(",");
    const addMediaIds = selectedIds.filter(id => !prevSelectedFolderIds.includes(id)).join(",");

    // ===== BBPlayer 歌单流程 =====
    // 需要 playData 才能添加到 BBP；勾选了的歌单中未包含的 → 添加；已包含但未勾选的 → 移除（取消收藏）
    const bbpStops: Promise<void>[] = [];
    if (playData?.bvid && playData?.cid) {
      const trackInput = playDataToBBPTrack(playData);
      if (trackInput) {
        const bbpStore = useBBPPlaylistStore.getState();
        for (const playlist of editableBBPPlaylists) {
          const cached = bbpStore.getCachedTracks(playlist.id);
          const contains = cached.some(t => t.unique_key === trackInput.unique_key);
          const selected = selectedBBPIds.includes(playlist.id);
          if (selected && !contains) {
            bbpStops.push(
              bbpStore.addTrack(playlist.id, trackInput).then(() => {
                results.push(`已添加到「${playlist.title}」`);
              }),
            );
          } else if (!selected && contains) {
            bbpStops.push(
              bbpStore.removeTrack(playlist.id, trackInput.unique_key).then(() => {
                results.push(`已从「${playlist.title}」移除`);
              }),
            );
          }
        }
      }
    }

    try {
      setSubmitting(true);

      // 并行执行 BBP 操作
      if (bbpStops.length) {
        const bbpResults = await Promise.allSettled(bbpStops);
        if (bbpResults.some(r => r.status === "rejected")) hasError = true;
      }

      // B站收藏夹流程（无变更时跳过 API 调用，避免参数错误）
      if (rid && (addMediaIds || delMediaIds)) {
        let res: any;
        if (type === 12) {
          res = await postCollResourceDeal({
            rid,
            type: 12,
            add_media_ids: addMediaIds,
            del_media_ids: delMediaIds,
          });
        } else {
          res = await postFavFolderDeal({
            rid,
            add_media_ids: addMediaIds,
            del_media_ids: delMediaIds,
            type,
            platform: "web",
            ga: 1,
            gaia_source: "web_normal",
          });
        }

        if (res.code !== 0) {
          hasError = true;
          addToast({ title: res.message, color: "danger" });
        } else {
          if (addMediaIds) results.push("已添加到收藏夹");
          if (delMediaIds) results.push("已从收藏夹中移除");
        }
      }

      if (hasError) {
        addToast({ title: "部分操作失败，请重试", color: "danger" });
        return;
      }

      onFavSelectModalOpenChange(false);
      if (results.length) {
        addToast({ title: results.join("；"), color: "success" });
      } else {
        addToast({ title: "修改成功", color: "success" });
      }

      // 刷新当前播放项的收藏状态
      useMusicFavStore.getState().refreshIsFav();
      onSuccess?.(selectedIds);
    } finally {
      setSubmitting(false);
    }
  };

  // 可添加的 BBPlayer 歌单（owner 或 editor）
  const editableBBPPlaylists = useMemo(
    () => bbpPlaylists.filter(p => p.role === "owner" || p.role === "editor"),
    [bbpPlaylists],
  );

  // BBP 歌单可操作的前提：曲目携带 bvid + cid（可转换为 BBP track）
  const canOperateBBP = Boolean(playData?.bvid && playData?.cid);
  const hasBBP = Boolean(bbpToken) && editableBBPPlaylists.length > 0 && canOperateBBP;
  // B站收藏夹有数据变更、或 BBP 歌单勾选有变更时，提交可用
  const biliChanged = hasSameIds(selectedIds, prevSelectedRef.current) === false;
  const bbpChanged = !sameBBPSelection(selectedBBPIds, bvidFavPlaylistIds);
  const isSubmitDisabled = !biliChanged && !bbpChanged;

  return (
    <Modal
      disableAnimation
      hideCloseButton
      backdrop="opaque"
      scrollBehavior="inside"
      shouldBlockScroll={false}
      isOpen={isFavSelectModalOpen}
      onOpenChange={onFavSelectModalOpenChange}
      isDismissable={false}
      size="md"
      radius="md"
      classNames={{
        backdrop: "z-200",
        wrapper: "z-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-base font-medium">{title}</ModalHeader>
        <ModalBody className="px-0">
          <ScrollContainer style={{ height: "100%" }}>
            <div className="flex flex-col gap-1 overflow-auto px-4">
              {/* B站收藏夹列表 */}
              {data?.map(item => {
                const checked = selectedIds.includes(item.id);
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    onKeyDown={() => toggle(item.id)}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Checkbox
                      color="primary"
                      isSelected={checked}
                      onChange={() => toggle(item.id)}
                      onClick={e => e.stopPropagation()}
                      aria-label={item.title}
                    />
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">{item.media_count ?? 0} 个内容</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* BBPlayer 共享歌单列表 */}
              {hasBBP && (
                <>
                  {data && data.length > 0 && (
                    <div className="text-foreground-400 px-2 pt-3 pb-1 text-xs font-medium">BBPlayer 共享歌单</div>
                  )}
                  {editableBBPPlaylists.map(playlist => {
                    const checked = selectedBBPIds.includes(playlist.id);
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        key={playlist.id}
                        onClick={() => toggleBBP(playlist.id)}
                        onKeyDown={() => toggleBBP(playlist.id)}
                        className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Checkbox
                          color="primary"
                          isSelected={checked}
                          onChange={() => toggleBBP(playlist.id)}
                          onClick={e => e.stopPropagation()}
                          aria-label={playlist.title}
                        />
                        <RiMusic2Line size={16} className="text-foreground-400 flex-none" />
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{playlist.title}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">
                              {playlist.role === "owner" ? "创建者" : "编辑者"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </ScrollContainer>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleCancel} isDisabled={submitting}>
            取消
          </Button>
          <AsyncButton color="primary" onPress={handleConfirm} isDisabled={isSubmitDisabled}>
            确认
          </AsyncButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FavoritesSelectModal;
