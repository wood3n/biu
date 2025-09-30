import { useState } from "react";

import { Slider, SliderProps } from "@heroui/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

const Progress = ({ isDisabled }: SliderProps) => {
  const [hovered, setHovered] = useState(false);

  const { duration, currentTime, seek } = usePlayingQueue();

  const showThumb = hovered && !isDisabled;

  return (
    <Slider
      aria-label="播放进度"
      hideThumb
      minValue={0}
      maxValue={duration || 0}
      value={currentTime}
      onChange={v => seek(v as number)}
      isDisabled={isDisabled}
      size="sm"
      disableAnimation
      disableThumbScale
      color={showThumb ? "primary" : "foreground"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      renderThumb={thumbProps =>
        showThumb && (
          <div
            {...thumbProps}
            className="group bg-background shadow-medium top-1/2 cursor-grab rounded-full data-[dragging=true]:cursor-grabbing"
          >
            <span className="shadow-small block h-4 w-4 rounded-full bg-white" />
          </div>
        )
      }
      startContent={
        <div className="flex w-12 justify-center text-sm whitespace-nowrap opacity-70">
          {currentTime ? formatDuration(currentTime) : "-:--"}
        </div>
      }
      endContent={
        <span className="flex w-12 justify-center text-sm whitespace-nowrap opacity-70">
          {duration ? formatDuration(duration) : "-:--"}
        </span>
      }
      className={clx({
        "w-3/4": true,
        "cursor-pointer": !isDisabled,
        "cursor-default": isDisabled,
      })}
      classNames={{
        track: "h-[4px]",
      }}
    />
  );
};

export default Progress;
