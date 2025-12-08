import { Card } from "@heroui/react";

import ScrollContainer from "@/components/scroll-container";

import Collection from "./collection";
import DefaultMenus from "./default-menu";
import Logo from "./logo";

const SideNav = () => {
  return (
    <Card radius="none" shadow="none" className="flex h-full flex-none flex-col md:w-[220px]">
      <Logo />
      <ScrollContainer className="min-h-0 flex-1 px-4 pb-4">
        <DefaultMenus />
        <Collection />
      </ScrollContainer>
    </Card>
  );
};

export default SideNav;
