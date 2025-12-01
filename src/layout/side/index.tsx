import { Card } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import { ReactComponent as Logo } from "@/assets/icons/logo.svg";
import ScrollContainer from "@/components/scroll-container";

import Collection from "./collection";
import Menu from "./menu";

const SideNav = () => {
  const isMac = window.electron?.getPlatform() === "macos";

  return (
    <Card radius="none" shadow="none" className="flex h-full flex-none flex-col md:w-[220px]">
      <div
        className={twMerge(
          "window-drag text-primary flex flex-none items-center space-x-2 px-7 py-4",
          isMac && "pt-12",
        )}
      >
        <Logo className="h-10 w-10" />
        <span className="text-3xl leading-none font-bold">Biu</span>
      </div>
      <ScrollContainer className="min-h-0 flex-1 px-4 pb-4">
        <Menu />
        <Collection />
      </ScrollContainer>
    </Card>
  );
};

export default SideNav;
