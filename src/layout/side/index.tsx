import { Card } from "@heroui/react";

import ScrollContainer from "@/components/scroll-container";

import Collection from "./collection";
import Logo from "./logo";
import Menu from "./menu";

const SideNav = () => {
  return (
    <Card radius="none" shadow="none" className="flex h-full flex-none flex-col md:w-[220px]">
      <Logo />
      <ScrollContainer className="min-h-0 flex-1 px-4 pb-4">
        <Menu />
        <Collection />
      </ScrollContainer>
    </Card>
  );
};

export default SideNav;
