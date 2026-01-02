import React, { useEffect, useRef, useState } from "react";

import {
  addToast,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import { useRequest } from "ahooks";

import { getFavFolderCreatedListAll } from "@/service/fav-folder-created-list-all";
import { postFavFolderDeal } from "@/service/fav-folder-deal";
import { getAudioCreatedFavList } from "@/service/medialist-gateway-base-created";
import { postCollResourceDeal } from "@/service/medialist-gateway-coll-resource-deal";
import { useModalStore } from "@/store/modal";
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

/** 将视频添加到收藏夹或从收藏夹中移除 */
const FavoritesSelectModal = () => {
  const user = useUser(s => s.user);
  const isFavSelectModalOpen = useModalStore(s => s.isFavSelectModalOpen);
  const onFavSelectModalOpenChange = useModalStore(s => s.onFavSelectModalOpenChange);
  const favSelectModalData = useModalStore(s => s.favSelectModalData);
  const { rid, type = 2, title, favId, afterSubmit } = favSelectModalData || {};

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const prevSelectedRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isFavSelectModalOpen) {
      setSelectedIds([]);
      prevSelectedRef.current = [];
    }
  }, [isFavSelectModalOpen]);

  const { data, loading } = useRequest(
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

  const handleCancel = () => {
    onFavSelectModalOpenChange(false);
  };

  const handleConfirm = async () => {
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
        const isFavorite = selectedIds.includes(Number(favId));
        if (prevSelectedRef.current.length === 0) {
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

        afterSubmit?.(isFavorite);
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
      classNames={{
        backdrop: "z-200",
        wrapper: "z-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-base font-medium">{title}</ModalHeader>
        <ModalBody className="h-[800px] max-h-[800px] px-0">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spinner />
            </div>
          ) : data?.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">暂无收藏夹</div>
          ) : (
            <ScrollContainer style={{ height: "100%" }}>
              <div className="flex flex-col gap-1 overflow-auto px-4">
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
              </div>
            </ScrollContainer>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleCancel} isDisabled={submitting}>
            取消
          </Button>
          <AsyncButton
            color="primary"
            onPress={handleConfirm}
            isDisabled={hasSameIds(selectedIds, prevSelectedRef.current)}
          >
            确认
          </AsyncButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FavoritesSelectModal;
