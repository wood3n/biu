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
import { usePlayList } from "@/store/play-list";
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

/** 将视频的播放数据转换为 BBPlayer track input */
const playDataToBBPTrack = (playData: NonNullable<FavSelectModalData["playData"]>) => {
  if (!playData.bvid || !playData.cid) {
    return null;
  }
  return {
    unique_key: `bilibili:${playData.bvid}:${playData.cid}`,
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
  /** 选中的 BBPlayer 歌单 ID（单选，与 B 站收藏夹互斥） */
  const [selectedBBPId, setSelectedBBPId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const prevSelectedRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isFavSelectModalOpen) {
      setSelectedIds([]);
      setSelectedBBPId(null);
      prevSelectedRef.current = [];
    }
  }, [isFavSelectModalOpen]);

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
    setSelectedBBPId(null);
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const toggleBBP = (id: string) => {
    setSelectedIds([]);
    setSelectedBBPId(prev => (prev === id ? null : id));
  };

  const handleCancel = () => {
    onFavSelectModalOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!rid && !selectedBBPId) return;

    // 如果选中了 BBPlayer 歌单，走 BBPlayer 添加流程
    if (selectedBBPId && playData) {
      const trackInput = playDataToBBPTrack(playData);
      if (!trackInput) {
        addToast({ title: "无法获取视频信息，添加失败", color: "danger" });
        return;
      }
      try {
        setSubmitting(true);
        await useBBPPlaylistStore.getState().addTrack(selectedBBPId, trackInput);
        onFavSelectModalOpenChange(false);
        addToast({ title: "已添加到共享歌单", color: "success" });

        // 刷新当前播放项的收藏状态
        useMusicFavStore.getState().refreshIsFav();
        onSuccess?.([]);
      } catch {
        addToast({ title: "添加到共享歌单失败", color: "danger" });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // B站收藏夹流程
    if (!rid) return;
    const prevSelectedFolderIds = data?.filter(item => item.fav_state === 1)?.map(item => item.id) || [];
    const delMediaIds = prevSelectedFolderIds.filter(id => !selectedIds.includes(id)).join(",");
    const addMediaIds = selectedIds.filter(id => !prevSelectedFolderIds.includes(id)).join(",");

    try {
      setSubmitting(true);

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

      if (res.code === 0) {
        onFavSelectModalOpenChange(false);
        if (prevSelectedRef.current.length === 0 && selectedIds.length) {
          addToast({
            title: "已添加到收藏夹",
            color: "success",
          });
        } else if (!selectedIds.length) {
          addToast({
            title: "已从收藏夹中移除",
            color: "success",
          });
        } else {
          addToast({
            title: "修改成功",
            color: "success",
          });
        }

        // 刷新当前播放项的收藏状态
        const playItem = usePlayList.getState().getPlayItem();
        if (
          (playItem?.type === "audio" && String(playItem?.sid) === String(rid)) ||
          (playItem?.type === "mv" && String(playItem?.aid) === String(rid))
        ) {
          useMusicFavStore.getState().refreshIsFav();
        }

        onSuccess?.(selectedIds);
      } else {
        addToast({
          title: res.message,
          color: "danger",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 可添加的 BBPlayer 歌单（owner 或 editor）
  const editableBBPPlaylists = useMemo(
    () => bbpPlaylists.filter(p => p.role === "owner" || p.role === "editor"),
    [bbpPlaylists],
  );

  const hasBBP = Boolean(bbpToken) && editableBBPPlaylists.length > 0;
  const canSubmitToBBP = Boolean(selectedBBPId && playData?.bvid && playData?.cid);
  const biliDisabled = selectedBBPId !== null;
  const bbpDisabled = selectedIds.length > 0;
  const isSubmitDisabled =
    (selectedBBPId === null && hasSameIds(selectedIds, prevSelectedRef.current)) ||
    (selectedBBPId !== null && !canSubmitToBBP);

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
                    onClick={() => !biliDisabled && toggle(item.id)}
                    onKeyDown={() => !biliDisabled && toggle(item.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${biliDisabled ? "pointer-events-none opacity-40" : ""}`}
                  >
                    <Checkbox
                      color="primary"
                      isSelected={checked}
                      onChange={() => toggle(item.id)}
                      onClick={e => e.stopPropagation()}
                      aria-label={item.title}
                      isDisabled={biliDisabled}
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
                    const checked = selectedBBPId === playlist.id;
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        key={playlist.id}
                        onClick={() => !bbpDisabled && toggleBBP(playlist.id)}
                        onKeyDown={() => !bbpDisabled && toggleBBP(playlist.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${bbpDisabled ? "pointer-events-none opacity-40" : ""}`}
                      >
                        <Checkbox
                          color="primary"
                          isSelected={checked}
                          onChange={() => toggleBBP(playlist.id)}
                          onClick={e => e.stopPropagation()}
                          aria-label={playlist.title}
                          isDisabled={bbpDisabled}
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
