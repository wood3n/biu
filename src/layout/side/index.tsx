import { Card } from "@heroui/react";

import Collection from "./collection";
import Menu from "./menu";

const SideNav = () => {
  return (
    <Card className="flex h-full flex-none flex-col md:w-[240px]">
      <Menu />
      <Collection />
    </Card>
  );
};

export default SideNav;
