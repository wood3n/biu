import React from "react";

import { Tooltip, Switch } from "@heroui/react";

import { getPlayModeList, PlayMode } from "@/common/constants/audio";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const PlayModeList = getPlayModeList(18);

/** 主界面：普通毛玻璃（不含 glass-menu 标记，避免控件 hover 高亮） */
const defaultGlassContent =
  "bg-background/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 dark:border-white/5";

/** 全屏播放器：胶囊同款深色毛玻璃 */
const darkGlassContent =
  "bg-black/25 backdrop-blur-2xl backdrop-saturate-150 border border-white/12 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]";

/** base slot：只负责定位，不需要背景/边框（避免和 content 叠加出双框） */
const baseClass = "bg-transparent border-0 shadow-none";

interface MusicPlayModeProps {
  /** "default" = 主界面普通毛玻璃；"dark" = 全屏播放器胶囊同款深色毛玻璃 */
  variant?: "default" | "dark";
}

const MusicPlayMode = ({ variant = "default" }: MusicPlayModeProps) => {
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
    const contentClass = variant === "dark" ? darkGlassContent : defaultGlassContent;

    return (
      <Tooltip
        disableAnimation
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="top"
        closeDelay={150}
        classNames={{
          base: baseClass,
          content: contentClass,
        }}
        content={
          <div onMouseEnter={openPopover} onMouseLeave={closePopoverWithDelay} className="px-3 py-2">
            <Switch
              size="sm"
              disableAnimation
              isSelected={shouldKeepPagesOrderInRandomPlayMode}
              onValueChange={setShouldKeepPagesOrderInRandomPlayMode}
              classNames={{
                wrapper: variant === "dark" ? "text-white" : undefined,
              }}
            >
              <span className={variant === "dark" ? "text-white/90" : "text-foreground/90"}>保持分集顺序</span>
            </Switch>
          </div>
        }
      >
        <IconButton
          className="flex-none"
          aria-label="播放模式"
          onPress={togglePlayMode}
          onMouseEnter={openPopover}
          onMouseLeave={closePopoverWithDelay}
        >
          {PlayModeList.find(item => item.value === playMode)?.icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <IconButton className="flex-none" aria-label="播放模式" onPress={togglePlayMode}>
      {PlayModeList.find(item => item.value === playMode)?.icon}
    </IconButton>
  );
};

export default MusicPlayMode;
