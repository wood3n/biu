import React, { useState } from "react";

import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from "@heroui/react";
import { RiAddCircleLine, RiSearchLine, RiStarLine } from "@remixicon/react";

import { postPlaylistTracks } from "@/service/playlist-tracks";
import { useUser } from "@/store/user";
import { useUserPlayList } from "@/store/user-playlist";

import ScrollContainer from "../scroll-container";
import SpinContainer from "../spin-container";

interface Props {
  id: number;
  className?: string;
}

/** 收藏歌曲 */
const Collection = ({ id, className }: Props) => {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const user = useUser(store => store.user);
  const [name, setName] = useState<string>();
  const { createList: createdPlaylist, updatePlayList } = useUserPlayList();
  const [loading, setLoading] = useState(false);

  const filteredPlaylist = createdPlaylist?.filter(item => (name?.trim() ? item.name.includes(name.trim()) : true));

  const add = async (playlistId: number) => {
    setLoading(true);
    try {
      await postPlaylistTracks({
        op: "add",
        pid: playlistId,
        tracks: String(id),
      });

      await updatePlayList(user?.profile?.userId as number);

      addToast({
        title: "添加成功",
        color: "success",
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="light" isIconOnly onPress={onOpen}>
        <RiStarLine size={18} className={className} />
      </Button>
      <Modal scrollBehavior="inside" disableAnimation isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">添加歌曲到歌单</ModalHeader>
          <ModalBody className="flex h-full min-h-80 flex-col">
            <SpinContainer loading={loading}>
              <Input
                value={name}
                onValueChange={setName}
                startContent={<RiSearchLine size={16} />}
                endContent={
                  name?.trim() && (
                    <Tooltip content="创建新歌单">
                      <Button startContent={<RiAddCircleLine />} size="sm" variant="light" isIconOnly />
                    </Tooltip>
                  )
                }
                placeholder="查找歌单"
              />
              {filteredPlaylist?.length ? (
                <ScrollContainer>
                  <div className="m-0 flex flex-grow flex-col space-y-2 overflow-y-auto">
                    {filteredPlaylist?.map(item => (
                      <div
                        key={item.id}
                        onPointerDown={() => {
                          add(item.id);
                        }}
                        className="flex cursor-pointer items-center space-x-2 rounded-lg p-1 hover:bg-zinc-800"
                      >
                        <div className="flex h-12 w-12 rounded-lg bg-zinc-800">
                          <img alt={item.name} src={item.coverImgUrl} className="h-full w-full rounded-lg" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-zinc-500">{item.trackCount}首</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollContainer>
              ) : (
                <div className="flex flex-grow items-center justify-center text-zinc-700">暂无歌单</div>
              )}
            </SpinContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Collection;
