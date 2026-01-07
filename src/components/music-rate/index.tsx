import React, { useState } from "react";

import { Button, Tooltip } from "@heroui/react";

import { PlayRate } from "@/common/constants/audio";
import { usePlayList } from "@/store/play-list";

const MusicRate = () => {
  const rate = usePlayList(s => s.rate);
  const setRate = usePlayList(s => s.setRate);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const tooltipId = "rate-tooltip";

  return (
    <Tooltip
      disableAnimation
      triggerScaleOnOpen={false}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
      placement="top"
      closeDelay={500}
      showArrow={false}
      classNames={{
        content: "py-3 px-2 w-[60px] min-w-[60px]",
      }}
      content={
        <div className="flex flex-col items-center gap-1">
          {PlayRate.map(v => (
            <Button
              key={v}
              isIconOnly
              size="sm"
              color={v === rate ? "primary" : "default"}
              variant={v === rate ? "solid" : "light"}
              className="min-w-[40px]"
              aria-label={`${v}倍速`}
              onPress={() => setRate(v)}
            >
              {v}x
            </Button>
          ))}
        </div>
      }
    >
      <Button
        isIconOnly
        variant="light"
        size="sm"
        className="hover:text-primary min-w-fit text-[16px]"
        aria-label="播放速率"
        aria-describedby={tooltipId}
      >
        {rate}x
      </Button>
    </Tooltip>
  );
};

export default MusicRate;
