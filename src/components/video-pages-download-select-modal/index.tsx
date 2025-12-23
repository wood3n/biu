import { useState } from "react";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, Spinner, addToast } from "@heroui/react";
import { useRequest } from "ahooks";
import { useShallow } from "zustand/react/shallow";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { useModalStore } from "@/store/modal";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

const VideoPagesDownloadSelectModal = () => {
  const { isVideoPageDownloadModalOpen, onVideoPageDownloadModalOpenChange, videoPageDownloadModalData } =
    useModalStore(
      useShallow(state => ({
        isVideoPageDownloadModalOpen: state.isVideoPageDownloadModalOpen,
        onVideoPageDownloadModalOpenChange: state.onVideoPageDownloadModalOpenChange,
        videoPageDownloadModalData: state.videoPageDownloadModalData,
      })),
    );

  const { outputFileType, title, cover, bvid } = videoPageDownloadModalData || {};

  const [selectedCids, setSelectedCids] = useState<string[]>([]);

  const { data, loading } = useRequest(
    async () => {
      if (!bvid) return [];
      const res = await getPlayerPagelist({
        bvid,
      });

      if (res?.data?.length > 1) {
        setSelectedCids(res?.data?.map(item => String(item.cid)) || []);
      } else if (res?.data?.[0]?.cid) {
        const cid = String(res.data[0].cid);
        await window.electron.addMediaDownloadTask({
          outputFileType: outputFileType!,
          cover,
          title: title!,
          bvid,
          cid,
        });
        onVideoPageDownloadModalOpenChange(false);
        addToast({
          title: "已添加到下载队列",
          color: "success",
        });
      }

      return res?.data || [];
    },
    {
      ready: Boolean(isVideoPageDownloadModalOpen && bvid),
      refreshDeps: [bvid],
    },
  );

  const downloadSelected = async () => {
    await window.electron.addMediaDownloadTaskList(
      data!
        .filter(item => selectedCids.includes(String(item.cid)))
        .map(item => ({
          outputFileType: outputFileType!,
          title: item.part || title!,
          bvid: bvid!,
          cover: item.first_frame || cover,
          cid: String(item.cid),
        })),
    );
    onVideoPageDownloadModalOpenChange(false);
    addToast({
      title: "已添加到下载队列",
      color: "success",
    });
  };

  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isVideoPageDownloadModalOpen}
      onOpenChange={onVideoPageDownloadModalOpenChange}
    >
      <ModalContent>
        {Boolean(data?.length) && <ModalHeader>选择分集</ModalHeader>}
        <ModalBody className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner label="获取分集信息中..." />
            </div>
          ) : (
            <ScrollContainer>
              <div className="flex flex-col space-y-1">
                {data?.map(item => {
                  const isSelected = selectedCids.includes(String(item.cid));

                  return (
                    <Checkbox
                      disableAnimation
                      key={item.cid}
                      aria-label={item.part}
                      isSelected={isSelected}
                      onValueChange={isSelected => {
                        if (isSelected) {
                          setSelectedCids([...selectedCids, String(item.cid)]);
                        } else {
                          setSelectedCids(selectedCids.filter(cid => cid !== String(item.cid)));
                        }
                      }}
                      className="hover:bg-content2 m-0 flex w-full max-w-full truncate px-6 py-4"
                      classNames={{
                        label: "truncate",
                      }}
                    >
                      {item.part}
                    </Checkbox>
                  );
                })}
              </div>
            </ScrollContainer>
          )}
        </ModalBody>
        {Boolean(data?.length) && (
          <ModalFooter>
            <Checkbox
              aria-label="全选"
              isSelected={selectedCids.length === data?.length}
              onValueChange={isSelected => {
                if (isSelected) {
                  setSelectedCids(data?.map(item => String(item.cid)) || []);
                } else {
                  setSelectedCids([]);
                }
              }}
              className="px-4"
            >
              全选
            </Checkbox>
            <AsyncButton color="primary" isDisabled={!selectedCids.length} onPress={downloadSelected}>
              下载
            </AsyncButton>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VideoPagesDownloadSelectModal;
