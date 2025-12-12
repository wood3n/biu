import { Button, useDisclosure } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

import { PlayBarIconSize } from "../constants";
import Download from "./download";
import MvFavFolderSelect from "./mv-fav-folder-select";
import PlayListDrawer from "./play-list-drawer";
import PlayModeSwitch from "./play-mode";
import Rate from "./rate";
import Volume from "./volume";

const RightControl = () => {
  const user = useUser(s => s.user);
  const playId = usePlayList(s => s.playId);
  const { isOpen: isQueueOpen, onOpen: onQueueOpen, onOpenChange: onQueueOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex h-full items-center justify-end space-x-2">
        <PlayModeSwitch />
        {Boolean(user?.isLogin) && Boolean(playId) && <MvFavFolderSelect />}
        {Boolean(playId) && <Download />}
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onQueueOpen}>
          <RiPlayListLine size={PlayBarIconSize.SideIconSize} />
        </Button>
        <Volume />
        <Rate />
      </div>
      <PlayListDrawer isOpen={isQueueOpen} onOpenChange={onQueueOpenChange} />
    </>
  );
};

export default RightControl;
