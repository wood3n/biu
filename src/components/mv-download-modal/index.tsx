import { useState } from "react";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@heroui/react";
import { useRequest } from "ahooks";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { useDownloadQueue } from "@/store/download-queue";

import ScrollContainer from "../scroll-container";

interface Props {
  bvid: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const MVDownloadModal = ({ bvid, isOpen, onOpenChange }: Props) => {
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const { addList: addDownloadTask } = useDownloadQueue();

  const { data } = useRequest(
    async () => {
      const res = await getPlayerPagelist({
        bvid,
      });

      return res?.data || [];
    },
    {
      ready: isOpen,
      refreshDeps: [bvid],
    },
  );

  const download = () => {
    if (!data?.length) {
      return;
    }

    addDownloadTask(
      data
        ?.filter(item => selectedCids.includes(String(item.cid)))
        .map(item => ({
          bvid,
          cid: String(item.cid),
          title: item.part,
          coverImgUrl: "",
        })),
    );
  };

  return (
    <Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>视频分集</ModalHeader>
        <ModalBody className="p-0">
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
        </ModalBody>
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
          <Button color="primary" onPress={download}>
            下载
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MVDownloadModal;
