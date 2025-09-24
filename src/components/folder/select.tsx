import React, { useState } from "react";

import { addToast, Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useRequest } from "ahooks";

import { getFavFolderCreatedListAll } from "@/service/fav-folder-created-list-all";
import { postFavFolderDeal } from "@/service/fav-folder-deal";
import { useUser } from "@/store/user";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

export interface FolderSelectProps {
  rid: string;
  // 受控：显示/隐藏
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FolderSelect: React.FC<FolderSelectProps> = ({ rid, isOpen, onOpenChange }) => {
  const user = useUser(s => s.user);

  const { data } = useRequest(
    async () => {
      const res = await getFavFolderCreatedListAll({
        up_mid: user?.mid as number,
      });

      return res?.data?.list;
    },
    {
      ready: Boolean(isOpen && user?.mid),
    },
  );

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
    try {
      setSubmitting(true);
      const res = await postFavFolderDeal({
        rid,
        add_media_ids: selectedIds.join(","),
        type: 2,
        platform: "web",
      });

      if (res.code === 0) {
        onOpenChange(false);
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
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-base font-medium">添加到收藏夹</ModalHeader>
            <ModalBody className="max-h-80 px-0">
              {data?.length === 0 ? (
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
                            isSelected={checked}
                            disableAnimation
                            onChange={() => toggle(item.id)}
                            onClick={e => e.stopPropagation()}
                            aria-label={`选择收藏夹 ${item.title}`}
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
                isDisabled={data?.length === 0 || selectedIds.length === 0}
              >
                确认
              </AsyncButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FolderSelect;
