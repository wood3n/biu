import React from "react";

import { Modal, ModalBody, ModalContent } from "@heroui/react";

import QrcodeLogin from "./qrcode-login";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Login = ({ isOpen, onOpenChange }: Props) => {
  return (
    <Modal size="xs" isOpen={isOpen} isDismissable={false} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalBody className="flex-row items-center justify-center">
          <QrcodeLogin onClose={() => onOpenChange(false)} />
          {/* <Divider className="mt-6 h-42" orientation="vertical" />
          <PasswordLogin onSuccess={onClose} /> */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;
