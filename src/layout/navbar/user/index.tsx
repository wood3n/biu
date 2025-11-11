import { useNavigate } from "react-router";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Avatar,
  useDisclosure,
  addToast,
} from "@heroui/react";

import ConfirmModal from "@/components/confirm-modal";
import { postPassportLoginExit } from "@/service/passport-login-exit";
import { useToken } from "@/store/token";
import { useUser } from "@/store/user";

const UserCard = () => {
  const { user, clear: clearUserInfo } = useUser();
  const { clear: clearToken } = useToken();
  const navigate = useNavigate();
  const {
    isOpen: isConfirmLogoutModalOpen,
    onOpen: openConfirmLogoutModal,
    onOpenChange: onConfirmLogoutModalOpenChange,
  } = useDisclosure();

  const logout = async () => {
    const csrfToken = useToken.getState().tokenData?.bili_jct;
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
      clearUserInfo();
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

  return (
    <div className="window-no-drag">
      <Dropdown placement="bottom">
        <DropdownTrigger>
          <div className="mr-4 flex cursor-pointer items-center space-x-2">
            <Avatar
              isBordered
              size="sm"
              as="button"
              type="button"
              className="transition-transform hover:scale-105"
              src={user?.face}
            />
            <div className="text-medium font-medium">{user?.uname}</div>
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="用户操作" variant="flat">
          <DropdownItem key="avatar" className="items-center justify-center">
            <User
              as="button"
              type="button"
              avatarProps={{
                size: "sm",
                isBordered: true,
                src: user?.face,
              }}
              name={user?.uname}
              description={`Lv${user?.level_info?.current_level}`}
              onClick={() => navigate(`/user/${user?.mid}`)}
            />
          </DropdownItem>
          <DropdownItem key="settings" onClick={() => navigate("/settings")}>
            设置
          </DropdownItem>
          <DropdownItem
            key="feedback"
            onPress={() => window.electron.openExternal("https://github.com/wood3n/biu/issues")}
          >
            反馈
          </DropdownItem>
          <DropdownItem key="logout" color="danger" className="text-danger" onPress={openConfirmLogoutModal}>
            退出登录
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        type="danger"
        title="确认退出登录？"
        isOpen={isConfirmLogoutModalOpen}
        onOpenChange={onConfirmLogoutModalOpenChange}
        onConfirm={logout}
      />
    </div>
  );
};

export default UserCard;
