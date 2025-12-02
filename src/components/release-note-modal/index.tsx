import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import Typography from "../typography";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  releaseNotes?: string;
  footer?: React.ReactNode;
}

const ReleaseNoteModal = ({ isOpen, onOpenChange, releaseNotes, footer }: Props) => {
  return (
    <>
      <Modal
        radius="md"
        shouldBlockScroll={false}
        scrollBehavior="inside"
        size="lg"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        disableAnimation
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <span>✨ 新版本更新</span>
            </div>
          </ModalHeader>
          <ModalBody className="px-0">
            {releaseNotes?.trim() ? (
              <Typography content={releaseNotes} />
            ) : (
              <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">暂无更新日志</div>
            )}
          </ModalBody>
          <ModalFooter>{footer}</ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReleaseNoteModal;
