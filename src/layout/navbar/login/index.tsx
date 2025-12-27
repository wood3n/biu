import React from "react";

import { Divider, Modal, ModalBody, ModalContent, Tab, Tabs } from "@heroui/react";

import CodeLogin from "./code-login";
import PasswordLogin from "./password-login";
import QrcodeLogin from "./qrcode-login";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Login = ({ isOpen, onOpenChange }: Props) => {
  const onClose = () => onOpenChange(false);

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      isDismissable={false}
      onOpenChange={onOpenChange}
      classNames={{
        base: "theme-aware-modal",
      }}
    >
      <ModalContent className="text-foreground">
        <ModalBody className="flex-row items-center justify-center gap-8 py-8">
          <QrcodeLogin onClose={onClose} />
          <Divider className="h-42" orientation="vertical" />
          <div className="w-[320px]">
            <Tabs
              aria-label="登录方式"
              classNames={{ tabContent: "text-lg font-medium mb-4 text-foreground" }}
              fullWidth
              size="lg"
              variant="underlined"
            >
              <Tab key="code" title="短信登录">
                <CodeLogin onClose={onClose} />
              </Tab>
              <Tab key="password" title="密码登录">
                <PasswordLogin onClose={onClose} />
              </Tab>
            </Tabs>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;
