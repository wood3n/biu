import React from "react";

import { Button, Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/react";

import QrcodeLogin from "./qrcode-login";

const Login = () => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  return (
    <>
      <Button color="primary" variant="flat" onPress={onOpen} className="window-no-drag text-white">
        登录
      </Button>
      <Modal size="xs" isOpen={isOpen} isDismissable={false} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody className="flex-row items-center justify-center">
            <QrcodeLogin onClose={onClose} />
            {/* <Divider className="mt-6 h-42" orientation="vertical" />
            <PasswordLogin onSuccess={onClose} /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Login;
