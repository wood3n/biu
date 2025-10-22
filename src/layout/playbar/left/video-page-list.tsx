import React, { useMemo } from "react";

import { Button, Image, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { RiListRadio, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import ScrollContainer from "@/components/scroll-container";
import { usePlayingQueue } from "@/store/playing-queue";

const VideoPageList = () => {
  const { current, playPage } = usePlayingQueue();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const pages = useMemo(() => current?.pages ?? [], [current?.pages]);

  return (
    <>
      <Button isIconOnly size="sm" variant="light" onPress={onOpen}>
        <RiListRadio size={18} />
      </Button>
      <Modal
        disableAnimation
        backdrop="transparent"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        className="bg-content2"
      >
        <ModalContent>
          <ModalHeader>分集</ModalHeader>
          <ModalBody className="p-0">
            <ScrollContainer className="max-h-[60vh]">
              <div className="mb-4 flex flex-col px-3">
                {pages.map(p => {
                  const isActive = p.pageIndex === current?.currentPage;

                  return (
                    <div
                      key={p.pageCid}
                      className="group flex cursor-default items-center gap-3 rounded-xl p-3 hover:bg-zinc-700"
                      onClick={() => playPage(p.pageCid)}
                    >
                      <div className="relative h-12 w-12 flex-none overflow-hidden rounded-md">
                        <Image
                          radius="sm"
                          alt={p.pageTitle}
                          src={p.pageFirstFrameImageUrl}
                          className="h-full w-full object-cover"
                          removeWrapper
                        />
                        {!isActive && (
                          <div className="absolute top-0 left-0 z-30 flex h-full w-full items-center justify-center opacity-0 group-hover:bg-gray-400/30 group-hover:opacity-100">
                            <RiPlayFill />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={clx("truncate", { "text-primary": isActive })} title={p.pageTitle}>
                          {p.pageTitle}
                        </div>
                      </div>
                      {Boolean(p.pageDuration) && (
                        <div className="text-foreground-500 ml-2 flex-none text-right text-sm tabular-nums">
                          {formatDuration(p.pageDuration as number)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VideoPageList;
