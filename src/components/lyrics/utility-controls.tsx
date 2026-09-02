import { useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger, Slider } from "@heroui/react";
import { RiChat3Line, RiVolumeDownLine, RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";

import IconButton from "../icon-button";

/** 控制栏按钮通用样式（未激活态） */
const controlButtonClass =
  "bg-foreground/10 text-foreground/50 hover:bg-foreground/20 min-w-0 rounded-full text-xs font-semibold";

/** 统一音量更新逻辑（静音联动），与主界面音量控件行为一致 */
const applyVolumeChange = (next: number) => {
  const state = usePlayList.getState();
  if (state.isMuted) {
    state.toggleMute();
  }
  if (next === 0) {
    state.toggleMute();
  }
  state.setVolume(next);
};

/** 音量控制：点击弹出竖向滑条，滚轮快捷调节 */
const VolumeControl = () => {
  const volume = usePlayList(s => s.volume);
  const isMuted = usePlayList(s => s.isMuted);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const effectiveVolume = isMuted ? 0 : volume;

  // 按钮上滚轮快捷调节音量（阻止歌词区滚动）
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const state = usePlayList.getState();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      applyVolumeChange(Math.max(0, Math.min(1, state.volume + delta)));
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div ref={wrapperRef}>
      <Popover
        placement="left"
        showArrow={false}
        shouldCloseOnBlur={false}
        disableAnimation
        offset={8}
        isOpen={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger>
          <IconButton type="button" aria-label="音量调节" className={controlButtonClass}>
            {isMuted ? (
              <RiVolumeMuteLine size={16} />
            ) : volume > 0.5 ? (
              <RiVolumeUpLine size={16} />
            ) : (
              <RiVolumeDownLine size={16} />
            )}
          </IconButton>
        </PopoverTrigger>
        <PopoverContent className="border border-white/12 bg-black/25 px-3 py-2 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="flex flex-col items-center gap-2">
            <Slider
              aria-label="音量"
              minValue={0}
              maxValue={1}
              step={0.01}
              value={effectiveVolume}
              onChange={v => applyVolumeChange(v as number)}
              size="sm"
              color="primary"
              orientation="vertical"
              className="h-28"
              classNames={{
                track: "w-1",
                thumb: "after:hidden data-[hover=true]:bg-primary data-[hover=true]:scale-100",
              }}
            />
            <span className="text-[10px] font-bold whitespace-nowrap text-white/60">
              {Math.round(effectiveVolume * 100)}%
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface UtilityControlsProps {
  /** 打开评论面板（仅在线视频曲目提供） */
  onOpenComments?: () => void;
}

/** 播放器常驻工具组：查看评论 + 音量调节（不随歌词显隐） */
const UtilityControls = ({ onOpenComments }: UtilityControlsProps) => {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-3">
      {onOpenComments && (
        <IconButton
          type="button"
          aria-label="查看评论"
          tooltip="查看评论"
          className="bg-foreground/10 text-foreground/50 hover:bg-foreground/20 hover:text-foreground min-w-0 rounded-full text-xs font-semibold"
          onPress={onOpenComments}
        >
          <RiChat3Line size={16} />
        </IconButton>
      )}
      <VolumeControl />
    </div>
  );
};

export default UtilityControls;
