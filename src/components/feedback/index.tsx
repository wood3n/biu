import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FeedBack = ({ isOpen, onOpenChange }: Props) => {
  return (
    <Modal disableAnimation size="3xl" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">反馈</ModalHeader>
        <ModalBody></ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FeedBack;
