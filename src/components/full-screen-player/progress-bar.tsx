import { memo } from "react";

import { Slider } from "@heroui/react";

import { formatDuration } from "@/common/utils/time";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";

interface Props {
  isDisabled?: boolean;
}

/**
 * 全屏播放器底部进度条：贴紧窗口最底部，带辉光效果。
 */
const FullScreenProgressBar = memo(({ isDisabled }: Props) => {
  const currentTime = usePlayProgress(s => s.currentTime);
  const duration = usePlayList(s => s.duration);
  const seek = usePlayList(s => s.seek);

  return (
    <Slider
      aria-label="播放进度"
      hideThumb={isDisabled}
      minValue={0}
      maxValue={duration}
      value={currentTime}
      onChange={v => seek(v as number)}
      isDisabled={isDisabled}
      size="sm"
      color="primary"
      className="w-full"
      classNames={{
        track: "h-[5px] cursor-pointer bg-white/20",
        filler: "bg-primary shadow-[0_0_12px_2px_hsl(var(--heroui-primary)/0.6)]",
        thumb: "w-3 h-3 bg-primary after:hidden shadow-none",
      }}
      getValue={v => formatDuration(Array.isArray(v) ? v[0] : v)}
    />
  );
});

export default FullScreenProgressBar;
