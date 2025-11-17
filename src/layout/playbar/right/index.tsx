import { Button, useDisclosure } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

import Download from "./download";
import MvFavFolderSelect from "./mv-fav-folder-select";
import PlayQueueDrawer from "./play-queue-drawer";
import Rate from "./rate";
import Volume from "./volume";

const RightControl = () => {
  const user = useUser(s => s.user);
  const { current, rate, volume, isMuted, setRate, setVolume, toggleMute } = usePlayingQueue();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex h-full items-center justify-end space-x-2">
        {Boolean(user?.isLogin) && Boolean(current) && <MvFavFolderSelect />}
        {Boolean(current) && <Download />}
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onOpen}>
          <RiPlayListLine size={18} />
        </Button>
        <Volume value={volume} onChange={setVolume} isMuted={isMuted} onChangeMute={toggleMute} />
        <Rate value={rate} onChange={setRate} />
      </div>
      <PlayQueueDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default RightControl;
