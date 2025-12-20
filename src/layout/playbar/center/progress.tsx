import { memo, useState } from "react";

import { Slider, type SliderProps } from "@heroui/react";

import { formatDuration } from "@/common/utils";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";

const ProgressSlider = memo(({ isDisabled }: SliderProps) => {
  const [hovered, setHovered] = useState(false);
  const currentTime = usePlayProgress(s => s.currentTime);
  const duration = usePlayList(s => s.duration);
  const seek = usePlayList(s => s.seek);

  const showThumb = !isDisabled && hovered;

  return (
    <>
      <div className="flex justify-center text-sm whitespace-nowrap opacity-70">
        {currentTime ? formatDuration(currentTime) : "-:--"}
      </div>
      <Slider
        aria-label="播放进度"
        hideThumb={!showThumb}
        minValue={0}
        maxValue={duration}
        value={currentTime}
        onChange={v => seek(v as number)}
        isDisabled={isDisabled}
        size="sm"
        color={showThumb ? "primary" : "foreground"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex-1"
        classNames={{
          track: "h-[4px] cursor-pointer",
          thumb: "w-4 h-4 bg-primary after:hidden",
        }}
      />
    </>
  );
});

ProgressSlider.displayName = "ProgressSlider";

const Progress = ({ isDisabled }: SliderProps) => {
  const duration = usePlayList(s => s.duration);
  return (
    <div className="flex w-3/4 items-center space-x-2">
      <ProgressSlider isDisabled={isDisabled} />
      <span className="flex justify-center text-sm whitespace-nowrap opacity-70">
        {duration ? formatDuration(duration) : "-:--"}
      </span>
    </div>
  );
};

export default Progress;
