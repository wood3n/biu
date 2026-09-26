import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
  useDisclosure,
  type DropdownItemProps,
} from "@heroui/react";
import { RiDownloadLine, RiExternalLinkLine, RiLogoutCircleLine, RiMusic2Line, RiUser3Line } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import { glassMenuClassName } from "@/common/constants/glass";
import BBPLoginModal from "@/components/bbp-login-modal";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { useFavoritesStore } from "@/store/favorite";
import { useModalStore } from "@/store/modal";

interface DropdownItemConfig extends DropdownItemProps {
  key: string;
  label: string;
  hidden?: boolean;
}

const BBPButton = () => {
  const bbpToken = useBBPTokenStore(s => s.token);
  const bbpAccount = useBBPTokenStore(s => s.account);

  const { isOpen: isBBPLoginOpen, onOpen: openBBPLogin, onOpenChange: onBBPLoginOpenChange } = useDisclosure();
  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const isLogin = Boolean(bbpToken);

  const items: DropdownItemConfig[] = [
    {
      key: "bbp-account",
      label: bbpAccount ? bbpAccount.name : "BBPlayer",
      startContent: <RiUser3Line size={18} />,
      isReadOnly: true,
      className: "cursor-default opacity-60",
      hidden: !isLogin,
    },
    {
      key: "bbp-login",
      label: "登录 BBPlayer",
      startContent: <RiMusic2Line size={18} />,
      hidden: isLogin,
      onPress: openBBPLogin,
    },
    {
      key: "bbp-download",
      label: "下载 App",
      startContent: <RiDownloadLine size={18} />,
      endContent: <RiExternalLinkLine size={18} />,
      onPress: () => window.electron.openExternal("https://github.com/bbplayer-app/bbplayer/releases"),
    },
    {
      key: "bbp-logout",
      label: "退出 BBPlayer",
      startContent: <RiLogoutCircleLine size={18} />,
      color: "danger" as const,
      className: "text-danger",
      hidden: !isLogin,
      onPress: () => {
        onOpenConfirmModal({
          title: "确认退出 BBPlayer 账号？",
          type: "danger",
          onConfirm: async () => {
            useBBPTokenStore.getState().clear();
            useBBPPlaylistStore.getState().clearCache();
            await useFavoritesStore.getState().updateCreatedFavorites("");
            await useFavoritesStore.getState().updateCollectedFavorites("");
            addToast({ title: "已退出 BBPlayer", color: "success" });
            return true;
          },
        });
      },
    },
  ].filter(item => !item.hidden);

  if (!items.length) {
    return null;
  }

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
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="light"
            radius="md"
            size="sm"
            title="移动端账号"
            className="hover:text-primary !px-0 text-inherit hover:!bg-transparent"
          >
            <RiMusic2Line size={18} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="移动端账号操作" variant="flat" items={items}>
          {({ key, label, className, ...rest }) => (
            <DropdownItem className={twMerge("rounded-medium", className)} key={key} {...rest}>
              {label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <BBPLoginModal isOpen={isBBPLoginOpen} onOpenChange={onBBPLoginOpenChange} />
    </>
  );
};

export default BBPButton;
