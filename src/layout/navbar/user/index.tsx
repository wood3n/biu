import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User, Avatar } from "@heroui/react";

import { useUser } from "@/store/user";

const UserCard = () => {
  const { user } = useUser();

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          type="button"
          className="transition-transform hover:scale-105"
          src={user?.face}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="用户操作" variant="flat">
        <DropdownItem key="settings">
          <User
            as="button"
            type="button"
            avatarProps={{
              isBordered: true,
              src: user?.face,
            }}
            className="transition-transform"
            name={user?.uname}
            description={`LV${user?.level_info?.current_level}`}
          />
        </DropdownItem>
        <DropdownItem key="settings">设置</DropdownItem>
        <DropdownItem key="help_and_feedback">帮助与反馈</DropdownItem>
        <DropdownItem key="logout" color="danger" className="text-danger">
          退出登录
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserCard;
