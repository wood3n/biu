import { useState } from "react";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, Spinner, addToast } from "@heroui/react";
import { useRequest } from "ahooks";

import { getPlayerPagelist } from "@/service/player-pagelist";

import AsyncButton from "../async-button";
import ScrollContainer from "../scroll-container";

interface Props {
  title: string;
  cover: string;
  bvid: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const VideoSelect = ({ title, cover, bvid, isOpen, onOpenChange }: Props) => {
  const [selectedCids, setSelectedCids] = useState<string[]>([]);

  const { data, loading } = useRequest(
    async () => {
      const res = await getPlayerPagelist({
        bvid,
      });

      if (res?.data?.length > 1) {
        setSelectedCids(res?.data?.map(item => String(item.cid)) || []);
      } else if (res?.data?.[0]?.cid) {
        const cid = String(res.data[0].cid);
        await window.electron.addMediaDownloadTask({
          outputFileType: "video",
          cover,
          title,
          bvid,
          cid,
        });
        onOpenChange(false);
        addToast({
          title: "已添加到下载队列",
          color: "success",
        });
      }

      return res?.data || [];
    },
    {
      ready: isOpen,
      refreshDeps: [bvid],
    },
  );

  const downloadSelected = async () => {
    await window.electron.addMediaDownloadTaskList(
      data!
        .filter(item => selectedCids.includes(String(item.cid)))
        .map(item => ({
          outputFileType: "video",
          title,
          bvid,
          cid: String(item.cid),
        })),
    );
    onOpenChange(false);
    addToast({
      title: "已添加到下载队列",
      color: "success",
    });
  };

  return (
    <>
      <Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {Boolean(data?.length) && <ModalHeader>选择分集</ModalHeader>}
          <ModalBody className="p-0">
            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <Spinner label="获取音频信息中..." />
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
    </>
  );
};

export default VideoSelect;
