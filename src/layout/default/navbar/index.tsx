import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button, Input, Navbar, NavbarContent, NavbarItem, Tooltip } from "@heroui/react";
import { RiDownloadLine, RiHistoryLine, RiSearchLine } from "@remixicon/react";

import UserChip from "@/components/user";

import { navs } from "./navs";

const LayoutNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState<string>("/");

  useEffect(() => {
    const pathname = location.pathname?.slice(1);
    if (pathname) {
      setSelectedKey(pathname);
    }
  }, [location.pathname]);

  return (
    <Navbar isBordered isBlurred={false}>
      <NavbarContent justify="start" className="window-no-drag">
        <NavbarContent className="hidden gap-3 sm:flex">
          {navs.map(item => {
            const isActive = selectedKey === item.key;

            return (
              <NavbarItem key={item.key} isActive={isActive}>
                <Button
                  color={isActive ? "success" : "default"}
                  startContent={isActive && item.selectedIcon ? item.selectedIcon : item.icon}
                  size="sm"
                  variant={isActive ? "solid" : "light"}
                  onPress={() => navigate(item.key)}
                  className="text-base"
                >
                  {item.label}
                </Button>
              </NavbarItem>
            );
          })}
        </NavbarContent>
      </NavbarContent>
      <NavbarContent as="div" className="window-no-drag items-center" justify="end">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[10rem] h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="搜索"
          size="sm"
          startContent={<RiSearchLine size={18} />}
          type="search"
        />
        <UserChip />
        <Tooltip content="下载">
          <Button variant="light" isIconOnly size="sm">
            <RiDownloadLine size={20} />
          </Button>
        </Tooltip>
        <Tooltip content="最近播放">
          <Button variant="light" isIconOnly size="sm" onPress={() => navigate("/recent")}>
            <RiHistoryLine size={20} />
          </Button>
        </Tooltip>
      </NavbarContent>
    </Navbar>
  );
};

export default LayoutNavbar;
