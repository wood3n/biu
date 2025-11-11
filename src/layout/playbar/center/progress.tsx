import { useState } from "react";

import { Slider, type SliderProps } from "@heroui/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

const Progress = ({ isDisabled }: SliderProps) => {
  const [hovered, setHovered] = useState(false);

  const { duration, currentTime, seek } = usePlayingQueue();

  const showThumb = hovered && !isDisabled;

  return (
    <div className="flex w-3/4 items-center space-x-2">
      <div className="flex justify-center text-sm whitespace-nowrap opacity-70">
        {currentTime ? formatDuration(currentTime) : "-:--"}
      </div>
      <Slider
        aria-label="播放进度"
        hideThumb={!showThumb}
        minValue={0}
        maxValue={duration || 0}
        value={currentTime}
        onChange={v => seek(v as number)}
        isDisabled={isDisabled}
        size="sm"
        color={showThumb ? "primary" : "foreground"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clx("flex-1", {
          "cursor-pointer": !isDisabled,
          "cursor-not-allowed": isDisabled,
        })}
        classNames={{
          track: "h-[4px]",
          thumb: "after:bg-primary",
        }}
      />
      <span className="flex justify-center text-sm whitespace-nowrap opacity-70">
        {duration ? formatDuration(duration) : "-:--"}
      </span>
    </div>
  );
};

export default Progress;
