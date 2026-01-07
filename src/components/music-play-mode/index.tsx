import React from "react";

import { Popover, PopoverTrigger, PopoverContent, Switch } from "@heroui/react";

import { getPlayModeList, PlayMode } from "@/common/constants/audio";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const PlayModeList = getPlayModeList(18);

const MusicPlayMode = () => {
  const playMode = usePlayList(s => s.playMode);
  const togglePlayMode = usePlayList(s => s.togglePlayMode);
  const shouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.shouldKeepPagesOrderInRandomPlayMode);
  const setShouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.setShouldKeepPagesOrderInRandomPlayMode);
  const [isOpen, setIsOpen] = React.useState(false);
  const closeTimer = React.useRef<number | null>(null);

  const openPopover = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsOpen(true);
  };

  const closePopoverWithDelay = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimer.current = null;
    }, 150);
  };

  if (playMode === PlayMode.Random) {
    return (
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="top"
        triggerScaleOnOpen={false}
        motionProps={{
          variants: {
            enter: { opacity: 1, scale: 1, transition: { duration: 0.12 } },
            exit: { opacity: 0, scale: 1, transition: { duration: 0.1 } },
          },
        }}
      >
        <PopoverTrigger>
          <IconButton
            className="flex-none"
            aria-label="播放模式"
            onPress={togglePlayMode}
            onMouseEnter={openPopover}
            onMouseLeave={closePopoverWithDelay}
          >
            {PlayModeList.find(item => item.value === playMode)?.icon}
          </IconButton>
        </PopoverTrigger>
        <PopoverContent className="px-3 py-2" onMouseEnter={openPopover} onMouseLeave={closePopoverWithDelay}>
          <Switch
            size="sm"
            disableAnimation
            isSelected={shouldKeepPagesOrderInRandomPlayMode}
            onValueChange={setShouldKeepPagesOrderInRandomPlayMode}
          >
            保持分集顺序
          </Switch>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <IconButton className="flex-none" aria-label="播放模式" onPress={togglePlayMode}>
      {PlayModeList.find(item => item.value === playMode)?.icon}
    </IconButton>
  );
};

export default MusicPlayMode;
