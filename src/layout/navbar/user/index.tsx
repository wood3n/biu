import { useNavigate } from "react-router";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  useDisclosure,
  addToast,
  type DropdownItemProps,
} from "@heroui/react";
import {
  RiExternalLinkLine,
  RiFeedbackLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiProfileLine,
  RiRefreshLine,
  RiSettings3Line,
} from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import nofaceImg from "@/assets/images/noface.jpg";
import { glassMenuClassName } from "@/common/constants/glass";
import { postPassportLoginExit } from "@/service/passport-login-exit";
import { useBBPTokenStore } from "@/store/bbp-token";
import { useFavoritesStore } from "@/store/favorite";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";
import { useToken } from "@/store/token";
import { useUser } from "@/store/user";

import Login from "../login";

interface UserCardProps {
  onDropdownOpenChange?: (open: boolean) => void;
}

const UserCard = ({ onDropdownOpenChange }: UserCardProps) => {
  const user = useUser(s => s.user);
  const clearUser = useUser(s => s.clear);
  const clearToken = useToken(s => s.clear);
  const navigate = useNavigate();
  const updateSettings = useSettings(s => s.update);

  const { isOpen: isLoginModalOpen, onOpen: openLoginModal, onOpenChange: onLoginModalOpenChange } = useDisclosure();

  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const logout = async () => {
    const csrfToken = await window.electron.getCookie("bili_jct");
    if (!csrfToken) {
      addToast({
        title: "CSRF Token 不存在",
        color: "danger",
      });
      return false;
    }

    const res = await postPassportLoginExit({
      biliCSRF: csrfToken,
    });
    if (res?.code === 0) {
      clearToken();
      clearUser();
      useBBPTokenStore.getState().clear();
      updateSettings({
        hiddenMenuKeys: [],
      });
      usePlayList.getState().clear();
      useFavoritesStore.setState({
        createdFavorites: [],
        collectedFavorites: [],
      });
      usePlayProgress.setState({
        currentTime: 0,
      });
      navigate("/");
      return true;
    } else {
      addToast({
        title: res?.message || "退出登录失败",
        color: "danger",
      });
      return false;
    }
  };

  const dropdownItems: (DropdownItemProps & { label: string; hidden?: boolean })[] = [
    {
      key: "login",
      label: "登录",
      startContent: <RiLoginCircleLine size={18} />,
      hidden: user?.isLogin,
      onPress: openLoginModal,
    },
    {
      key: "profile",
      label: "个人资料",
      startContent: <RiProfileLine size={18} />,
      hidden: !user?.isLogin,
      onPress: () => navigate(`/user/${user?.mid}`),
    },
    {
      key: "settings",
      label: "设置",
      startContent: <RiSettings3Line size={18} />,
      onPress: () => navigate("/settings"),
    },
    {
      key: "refresh",
      label: "刷新数据",
      startContent: <RiRefreshLine size={18} />,
      onPress: async () => {
        try {
          await useUser.getState().updateUser();
          const mid = useUser.getState().user?.mid;
          if (mid) {
            await useFavoritesStore.getState().updateCreatedFavorites(mid);
            await useFavoritesStore.getState().updateCollectedFavorites(mid);
          } else if (useBBPTokenStore.getState().token) {
            await useFavoritesStore.getState().updateCreatedFavorites("");
            await useFavoritesStore.getState().updateCollectedFavorites("");
          }
          addToast({
            title: "数据刷新成功",
            color: "success",
          });
        } catch {
          addToast({
            title: "刷新数据失败",
            color: "danger",
          });
        }
      },
    },
    {
      key: "feedback",
      label: "问题反馈",
      startContent: <RiFeedbackLine size={18} />,
      endContent: <RiExternalLinkLine size={18} />,
      onPress: () => window.electron.openExternal("https://github.com/xRetia/biu/issues"),
    },
    {
      key: "logout",
      label: "退出登录",
      startContent: <RiLogoutCircleLine size={18} />,
      color: "danger" as const,
      className: "text-danger",
      hidden: !user?.isLogin,
      onPress: () => {
        onOpenConfirmModal({
          title: "确认退出登录？",
          type: "danger",
          onConfirm: async () => {
            await logout();
            return true;
          },
        });
      },
    },
  ].filter(item => !item.hidden);

  return (
    <>
      <Dropdown
        shouldBlockScroll={false}
        disableAnimation
        triggerScaleOnOpen={false}
        radius="md"
        classNames={{
          content: twMerge(glassMenuClassName, "min-w-[160px]"),
        }}
        onOpenChange={onDropdownOpenChange}
      >
        <DropdownTrigger>
          <Avatar
            showFallback
            size="sm"
            as="button"
            type="button"
            classNames={{ base: "mr-4 size-8 min-w-8 cursor-pointer transition-transform hover:scale-105" }}
            src={user?.face || nofaceImg}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="用户操作" variant="flat" items={dropdownItems}>
          {({ key, label, className, ...rest }) => (
            <DropdownItem className={twMerge("rounded-medium", className)} key={key} {...rest}>
              {label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <Login isOpen={isLoginModalOpen} onOpenChange={onLoginModalOpenChange} />
    </>
  );
};

export default UserCard;
