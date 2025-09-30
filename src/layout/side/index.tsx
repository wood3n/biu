import { Card } from "@heroui/react";

import ScrollContainer from "@/components/scroll-container";

import Collection from "./collection";
import Menu from "./menu";

const SideNav = () => {
  return (
    <Card radius="sm" className="h-full flex-none md:w-[260px]">
      <ScrollContainer className="p-4">
        <Menu />
        <Collection />
      </ScrollContainer>
    </Card>
  );
};

export default SideNav;
