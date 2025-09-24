import { useState } from "react";

import { Modal, ModalContent, ModalHeader, ModalBody, Checkbox, ModalFooter, Button, Spinner } from "@heroui/react";
import { useRequest } from "ahooks";

import { formatDuration } from "@/common/utils";
import { getPlayerPagelist } from "@/service/player-pagelist";
import { useDownloadQueue } from "@/store/download-queue";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

interface Props {
  bvid: string;
  title: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DownloadModal = ({ bvid, title, isOpen, onOpenChange }: Props) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { addList } = useDownloadQueue();

  const { loading, data: videoList } = useRequest(
    async () => {
      const res = await getPlayerPagelist({
        bvid,
      });

      return res?.data;
    },
    {
      ready: Boolean(isOpen && bvid),
      refreshDeps: [bvid],
      onSuccess: data => {
        if (data?.length === 1) {
          setSelectedIds(data.map(item => item.cid));
        }
      },
    },
  );

  const toggle = (cid: number) => {
    setSelectedIds(prev => {
      const next = [...prev];
      // 多选
      if (next.includes(cid)) {
        return next.filter(item => item !== cid);
      } else {
        next.push(cid);
        return next;
      }
    });
  };

  const videoPageLength = videoList?.length || 0;

  const addToDownloadQueue = () => {
    addList(
      videoList
        ?.filter(item => selectedIds.includes(item.cid))
        ?.map(item => ({
          bvid,
          cid: item.cid,
          title: item.part,
          cover: item.first_frame,
          duration: item.duration,
          progress: 0,
        })) || [],
    );

    onOpenChange(false);
  };

  return (
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} size="xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-base font-medium">{loading ? "获取视频信息..." : "选择视频分集"}</ModalHeader>
            <ModalBody className="max-h-80 px-0">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <ScrollContainer style={{ height: "100%" }}>
                  <div className="flex flex-col gap-1 overflow-auto px-4">
                    {videoList?.map(item => {
                      const checked = selectedIds.includes(item.cid);
                      return (
                        <div
                          role="button"
                          tabIndex={0}
                          key={item.cid}
                          onClick={() => toggle(item.cid)}
                          onKeyDown={() => toggle(item.cid)}
                          className="flex cursor-pointer items-center rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Checkbox
                            isSelected={checked}
                            disableAnimation
                            onChange={() => toggle(item.cid)}
                            onClick={e => e.stopPropagation()}
                            aria-label="选择视频分集"
                          />
                          <div className="flex min-w-0 flex-1 items-center space-x-2">
                            <span className="truncate">{videoPageLength > 1 ? item.part : title}</span>
                            {Boolean(item.duration) && (
                              <span className="text-zinc-500">{formatDuration(item.duration, false)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollContainer>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => onOpenChange(false)}>
                取消
              </Button>
              <AsyncButton color="primary" isDisabled={selectedIds.length === 0} onPress={addToDownloadQueue}>
                下载
              </AsyncButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DownloadModal;
