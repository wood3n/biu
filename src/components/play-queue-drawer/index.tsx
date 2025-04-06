import * as React from "react";

import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/react";

interface Props {
  isOpen: boolean;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange }: Props) => {
  return (
    <Drawer disableAnimation isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1">Drawer Title</DrawerHeader>
        <DrawerBody>播放列表</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayQueueDrawer;
