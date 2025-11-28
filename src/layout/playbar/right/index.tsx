import { Button, useDisclosure } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { usePlayQueue } from "@/store/play-queue";
import { useUser } from "@/store/user";

import { PlayBarIconSize } from "../constants";
import Download from "./download";
import MvFavFolderSelect from "./mv-fav-folder-select";
import PlayModeSwitch from "./play-mode";
import PlayQueueDrawer from "./play-queue-drawer";
import Rate from "./rate";
import Volume from "./volume";

const RightControl = () => {
  const user = useUser(s => s.user);
  const currentBvid = usePlayQueue(s => s.currentBvid);
  const { isOpen: isQueueOpen, onOpen: onQueueOpen, onOpenChange: onQueueOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex h-full items-center justify-end space-x-2">
        <PlayModeSwitch />
        {Boolean(user?.isLogin) && Boolean(currentBvid) && <MvFavFolderSelect />}
        {Boolean(currentBvid) && <Download />}
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onQueueOpen}>
          <RiPlayListLine size={PlayBarIconSize.SideIconSize} />
        </Button>
        <Volume />
        <Rate />
      </div>
      <PlayQueueDrawer isOpen={isQueueOpen} onOpenChange={onQueueOpenChange} />
    </>
  );
};

export default RightControl;
