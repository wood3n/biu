import React, { useLayoutEffect, useRef, useState } from "react";

import clx from "classnames";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";

import ScrollContainer from "../scroll-container";

interface Props {
  showMore?: {
    title?: React.ReactNode;
    content?: React.ReactNode;
    className?: string;
  };
  lines?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const lineClampMap = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const Ellipsis = ({ showMore, lines = 1, children, className, style }: Props) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useLayoutEffect(() => {
    if (textElementRef.current) {
      setIsOverflow(textElementRef.current!.scrollHeight > textElementRef.current!.clientHeight);
    }
  });

  return (
    <>
      <div ref={textElementRef} className={clx(className, lineClampMap[lines], "relative")} style={style}>
        {children}
        {isOverflowed && showMore && (
          <span
            role="button"
            onPointerDown={onOpen}
            tabIndex={0}
            className={clx(
              "absolute bottom-0 right-0 cursor-pointer bg-second-background text-zinc-500 shadow-[-22px_5px_18px_0px_#18181b] transition-colors hover:text-white",
              showMore.className,
            )}
          >
            ...更多
          </span>
        )}
      </div>
      {showMore && (
        <Modal size="5xl" isOpen={isOpen} disableAnimation scrollBehavior="inside" onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>{showMore.title}</ModalHeader>
            <ModalBody className="whitespace-pre-line leading-loose">
              <ScrollContainer>{showMore.content}</ScrollContainer>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Ellipsis;
