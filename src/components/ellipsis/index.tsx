import React, { useLayoutEffect, useRef, useState } from "react";

import clx from "classnames";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";

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

const Ellipsis = ({ showMore, lines = 2, children, className, style }: Props) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

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
          <div className="absolute bottom-0 right-0">
            <button
              type="button"
              onClick={onOpen}
              className="overflow-hidden rounded-l-lg bg-transparent pl-3 font-light italic backdrop-blur-sm hover:text-blue-500 hover:underline"
            >
              更多
            </button>
          </div>
        )}
      </div>
      {showMore && (
        <Modal
          size="3xl"
          autoFocus={false}
          isOpen={isOpen}
          hideCloseButton
          disableAnimation
          scrollBehavior="inside"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            <ModalHeader className="text-3xl">{showMore.title}</ModalHeader>
            <ModalBody className="whitespace-pre-line p-0 leading-loose">
              <ScrollContainer className="px-6">{showMore.content}</ScrollContainer>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>知道了</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Ellipsis;
