import React, { useCallback } from "react";

import { Divider, Modal, ModalBody, ModalContent, Tab, Tabs, addToast } from "@heroui/react";
import moment from "moment";

import { useFavoritesStore } from "@/store/favorite";
import { useToken } from "@/store/token";
import { useUser } from "@/store/user";

import CodeLogin from "./code-login";
import PasswordLogin from "./password-login";
import QrcodeLogin from "./qrcode-login";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Login = ({ isOpen, onOpenChange }: Props) => {
  const updateUser = useUser(state => state.updateUser);
  const updateToken = useToken(state => state.updateToken);
  const updateCreatedFavorites = useFavoritesStore(state => state.updateCreatedFavorites);
  const updateCollectedFavorites = useFavoritesStore(state => state.updateCollectedFavorites);

  const onClose = () => onOpenChange(false);

  const updateUserData = useCallback(
    async (refreshToken?: string) => {
      try {
        if (refreshToken) {
          updateToken({
            tokenData: { refresh_token: refreshToken },
            nextCheckRefreshTime: moment().add(2, "days").unix(),
          });
        }

        await updateUser();

        const user = useUser.getState().user;

        if (user?.mid) {
          await Promise.allSettled([updateCreatedFavorites(user.mid), updateCollectedFavorites(user.mid)]);
        }
      } catch {
        addToast({ title: "更新用户信息失败", color: "danger" });
      }
    },
    [updateCollectedFavorites, updateCreatedFavorites, updateToken, updateUser],
  );

  return (
    <Modal size="2xl" isOpen={isOpen} isDismissable={false} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalBody className="flex-row items-center justify-center gap-8 py-8">
          <QrcodeLogin onClose={onClose} updateUserData={updateUserData} />
          <Divider className="h-42" orientation="vertical" />
          <div className="w-[320px]">
            <Tabs
              aria-label="登录方式"
              classNames={{ cursor: "rounded-medium", tabContent: "text-lg font-medium mb-4" }}
              fullWidth
              size="lg"
              variant="underlined"
            >
              <Tab key="code" title="短信登录">
                <CodeLogin onClose={onClose} updateUserData={updateUserData} />
              </Tab>
              <Tab key="password" title="密码登录">
                <PasswordLogin onClose={onClose} updateUserData={updateUserData} />
              </Tab>
            </Tabs>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;
