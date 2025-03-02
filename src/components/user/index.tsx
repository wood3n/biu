import React from "react";

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, User } from "@heroui/react";

import { useUser } from "@/store/user";

const UserChip = () => {
  const user = useUser(store => store.user);

  return (
    <Dropdown>
      <DropdownTrigger>
        <User
          aria-label="打开个人信息设置以及反馈、退出登录"
          avatarProps={{
            size: "sm",
            src: user?.profile?.avatarUrl,
          }}
          name={user?.profile?.nickname}
          className="cursor-pointer"
        />
      </DropdownTrigger>
      <DropdownMenu variant="flat">
        <DropdownSection showDivider>
          <DropdownItem key="profile">我的会员</DropdownItem>
          <DropdownItem key="settings">个人设置</DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="help_and_feedback">帮助与反馈</DropdownItem>
          <DropdownItem key="logout" className="text-danger" color="danger">
            退出登录
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserChip;
