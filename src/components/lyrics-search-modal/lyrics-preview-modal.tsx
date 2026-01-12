import type { Dispatch, SetStateAction } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@heroui/react";

import ScrollContainer from "../scroll-container";

interface LyricsPreviewModalProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  title?: string;
  content?: string;
  onAdopt: () => void;
  loading?: boolean;
}

const LyricsPreviewModal = ({ isOpen, onOpenChange, title, content, onAdopt, loading }: LyricsPreviewModalProps) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="3xl">
    <ModalContent>
      <ModalHeader className="text-lg font-semibold">{title || "歌词预览"}</ModalHeader>
      <ModalBody className="px-0">
        {loading ? (
          <div className="flex h-[420px] items-center justify-center">
            <Spinner color="primary" label="加载中" />
          </div>
        ) : (
          <ScrollContainer className="px-4">
            <pre className="text-foreground/90 max-h-[420px] text-sm leading-relaxed break-words whitespace-pre-wrap">
              {content || "暂无歌词"}
            </pre>
          </ScrollContainer>
        )}
      </ModalBody>
      <ModalFooter className="justify-end gap-2">
        <Button color="primary" onPress={onAdopt} isDisabled={loading || !content}>
          采用歌词
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default LyricsPreviewModal;
