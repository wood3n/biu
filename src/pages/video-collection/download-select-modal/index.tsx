import { useEffect, useState } from "react";
import { useParams } from "react-router";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Image,
  Checkbox,
  addToast,
} from "@heroui/react";
import clx from "classnames";

import { CollectionType } from "@/common/constants/collection";
import ScrollContainer from "@/components/scroll-container";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";

import { getAllFavMedia } from "../utils";

interface DownloadSelectModalProps {
  type: CollectionType;
  outputFileType: MediaDownloadOutputFileType;
  mediaCount?: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface MediaData {
  id: string;
  type: "mv" | "audio";
  bvid?: string;
  sid?: number | string;
  title: string;
  cover: string;
}

const DownloadSelectModal = ({ type, outputFileType, mediaCount, isOpen, onOpenChange }: DownloadSelectModalProps) => {
  const { id } = useParams();
  const [list, setList] = useState<MediaData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getMedias = async () => {
    if (type === CollectionType.Favorite) {
      const res = await getAllFavMedia({
        id: id!,
        totalCount: mediaCount as number,
      });

      if (res?.length) {
        const medias = res
          .filter(item => (outputFileType === "video" ? item.type === "mv" : true))
          .map((item, index) => ({
            id: String(index),
            type: item.type,
            bvid: item.bvid,
            sid: item.sid,
            title: item.title,
            cover: item.cover,
          }));
        setList(medias);
        setSelectedIds(medias.map(item => item.id));
      }
    } else {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });

      if (res.code === 0) {
        const medias = res.data.medias.map((item, index) => ({
          id: String(index),
          type: "mv" as const,
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
        }));
        setList(medias);
        setSelectedIds(medias.map(item => item.id));
      }
    }
  };

  const handleDownload = async () => {
    if (selectedIds.length) {
      await window.electron.addMediaDownloadTaskList(
        selectedIds.map(id => {
          const media = list.find(item => item.id === id);
          return {
            outputFileType,
            bvid: media?.bvid,
            sid: media?.sid,
            title: media?.title as string,
            cover: media?.cover,
          };
        }),
      );

      onOpenChange(false);
      addToast({
        title: "下载任务已添加",
        color: "success",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      getMedias();
    }
  }, [isOpen, type, mediaCount]);

  return (
    <Modal disableAnimation scrollBehavior="inside" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>选择要下载的{outputFileType === "audio" ? "音频" : "视频"}</ModalHeader>
        <ModalBody className="px-0">
          <ScrollContainer className="px-4">
            {list.map(item => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  aria-label={item.title}
                  key={item.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedIds(prev => prev.filter(id => id !== item.id));
                    } else {
                      setSelectedIds(prev => [...prev, item.id]);
                    }
                  }}
                  className={clx(
                    "rounded-medium hover:bg-content2 border-content2 flex w-full cursor-default items-center justify-between border-1 px-4 py-2 not-last:mb-2",
                    {
                      "border-primary": isSelected,
                    },
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center">
                    <Image radius="md" src={item.cover} alt={item.title} className="h-12 w-12 flex-none object-cover" />
                    <span className="ml-2 min-w-0 flex-1 truncate">{item.title}</span>
                  </div>
                  <Checkbox disableAnimation isSelected={isSelected} className="ml-2" />
                </div>
              );
            })}
          </ScrollContainer>
        </ModalBody>
        <ModalFooter>
          <Checkbox
            disableAnimation
            isSelected={selectedIds.length === list.length}
            onValueChange={checked => {
              if (checked) {
                setSelectedIds(list.map(item => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
            className="mr-2"
          >
            全选
          </Checkbox>
          <Button color="primary" onPress={handleDownload}>
            下载
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DownloadSelectModal;
