import React, { useEffect, useRef, useState } from "react";

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { useModalStore } from "@/store/modal";
import { useUserPlaylistStore } from "@/store/user-playlist";

import ScrollContainer from "../scroll-container";

const PlaylistSelectModal = () => {
  const isOpen = useModalStore(s => s.isPlaylistSelectModalOpen);
  const onOpenChange = useModalStore(s => s.onPlaylistSelectModalOpenChange);
  const modalData = useModalStore(s => s.playlistSelectModalData);
  const playlists = useUserPlaylistStore(s => s.playlists);
  const addSongsToPlaylist = useUserPlaylistStore(s => s.addSongsToPlaylist);
  const createPlaylist = useUserPlaylistStore(s => s.createPlaylist);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewInput) newInputRef.current?.focus();
  }, [showNewInput]);

  const handleConfirm = () => {
    if (!modalData?.songs.length) return;

    if (showNewInput && newName.trim()) {
      const id = createPlaylist(newName);
      addSongsToPlaylist(id, modalData.songs);
      modalData.onSuccess?.(id);
      onOpenChange(false);
      resetState();
    } else if (selectedId) {
      addSongsToPlaylist(selectedId, modalData.songs);
      modalData.onSuccess?.(selectedId);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedId(null);
    setIsCreating(false);
    setNewName("");
    setShowNewInput(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Modal
      disableAnimation
      hideCloseButton
      backdrop="opaque"
      scrollBehavior="inside"
      shouldBlockScroll={false}
      isOpen={isOpen}
      onOpenChange={isOpen => {
        if (!isOpen) handleClose();
      }}
      isDismissable={false}
      size="md"
      radius="md"
      classNames={{
        backdrop: "z-200",
        wrapper: "z-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-base font-medium">{modalData?.title ?? "添加到歌单"}</ModalHeader>
        <ModalBody className="px-0">
          <ScrollContainer style={{ height: "100%" }}>
            <div className="flex flex-col gap-1 overflow-auto px-4">
              {playlists.length > 0 && !showNewInput && (
                <div className="mb-1 px-2 py-1 text-xs text-zinc-500">选择已有歌单</div>
              )}
              {!showNewInput &&
                playlists.map(pl => {
                  const checked = selectedId === pl.id;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={pl.id}
                      onClick={() => setSelectedId(pl.id)}
                      onKeyDown={() => setSelectedId(pl.id)}
                      className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <div className="flex h-5 w-5 items-center justify-center">
                        {checked ? (
                          <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <RiPlayListLine size={20} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{pl.name}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">{pl.songs.length} 首</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {showNewInput ? (
                <div className="flex flex-col gap-2 px-2">
                  <div className="text-xs text-zinc-500">新建歌单</div>
                  <Input
                    ref={newInputRef}
                    placeholder="输入歌单名称"
                    value={newName}
                    onValueChange={setNewName}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        setIsCreating(true);
                        handleConfirm();
                      }
                    }}
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowNewInput(true)}
                  onKeyDown={() => setShowNewInput(true)}
                  className="text-primary flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="text-sm">新建歌单</span>
                </div>
              )}
            </div>
          </ScrollContainer>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={isCreating}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            isDisabled={Boolean((!showNewInput && !selectedId) || (showNewInput && !newName.trim()))}
            isLoading={isCreating}
          >
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlaylistSelectModal;
