import { Card } from "@heroui/react";

import Collection from "./collection";
import Menu from "./menu";

const SideNav = () => {
  return (
    <Card className="flex h-full w-[240px] flex-none flex-col">
      <Menu />
      <Collection />
    </Card>
  );
};

export default SideNav;
