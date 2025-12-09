import React, { useRef, useState } from "react";

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
import { isEqual } from "es-toolkit/predicate";

import { getFavFolderCreatedListAll } from "@/service/fav-folder-created-list-all";
import { postFavFolderDeal } from "@/service/fav-folder-deal";
import { useUser } from "@/store/user";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

export interface FavFolderSelectProps {
  /** 视频aid，或者音频的id */
  rid: string;
  // 受控：显示/隐藏
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  afterSubmit?: (ids: number[]) => void;
}

const FavFolderSelect = ({ rid, isOpen, onOpenChange, title, afterSubmit }: FavFolderSelectProps) => {
  const user = useUser(s => s.user);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const prevSelectedRef = useRef<number[]>([]);

  const { data, loading } = useRequest(
    async () => {
      const res = await getFavFolderCreatedListAll({
        rid: Number(rid),
        type: 2,
        up_mid: user?.mid as number,
      });

      const collectedFolders = res?.data?.list?.filter(item => item.fav_state === 1) || [];
      if (collectedFolders?.length) {
        prevSelectedRef.current = collectedFolders.map(item => item.id);
        setSelectedIds(prevSelectedRef.current);
      } else {
        setSelectedIds([]);
      }

      return res?.data?.list;
    },
    {
      ready: Boolean(isOpen && user?.mid),
      refreshDeps: [isOpen, rid],
    },
  );

  const toggle = (id: number) => {
    setSelectedIds(prev => {
      const next = [...prev];
      // 多选
      if (next.includes(id)) {
        return next.filter(item => item !== id);
      } else {
        next.push(id);
        return next;
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    const prevSelectedFolderIds = data?.filter(item => item.fav_state === 1)?.map(item => item.id) || [];
    const delMediaIds = prevSelectedFolderIds.filter(id => !selectedIds.includes(id)).join(",");
    const addMediaIds = selectedIds.filter(id => !prevSelectedFolderIds.includes(id)).join(",");

    try {
      setSubmitting(true);
      const res = await postFavFolderDeal({
        rid,
        add_media_ids: addMediaIds,
        del_media_ids: delMediaIds,
        type: 2,
        platform: "web",
        ga: 1,
        gaia_source: "web_normal",
      });

      if (res.code === 0) {
        onOpenChange(false);
        afterSubmit?.(selectedIds);
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
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      size="md"
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
            isDisabled={isEqual(selectedIds, prevSelectedRef.current)}
          >
            确认
          </AsyncButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FavFolderSelect;
