import { Button, useDisclosure } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

import PlayQueueDrawer from "../play-queue";
import Download from "./download";
import Rate from "./rate";
import Volume from "./volume";

const RightControl = () => {
  const { current, rate, volume, isMuted, setRate, setVolume, toggleMute } = usePlayingQueue();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex h-full items-center justify-end space-x-2">
        {Boolean(current) && <Download />}
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onOpen}>
          <RiPlayListLine size={18} />
        </Button>
        <Rate value={rate} onChange={setRate} />
        <Volume value={volume} onChange={setVolume} isMuted={isMuted} onChangeMute={toggleMute} />
      </div>
      <PlayQueueDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default RightControl;
