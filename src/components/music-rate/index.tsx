import React, { useState } from "react";

import { Button, Tooltip } from "@heroui/react";

import { PlayRate } from "@/common/constants/audio";
import { usePlayList } from "@/store/play-list";

const MusicRate = () => {
  const rate = usePlayList(s => s.rate);
  const setRate = usePlayList(s => s.setRate);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const tooltipId = "rate-tooltip";

  // 处理点击事件，切换tooltip显示状态
  const handleClick = () => {
    setIsTooltipOpen(!isTooltipOpen);
  };

  // 处理鼠标进入事件，打开tooltip
  const handleMouseEnter = () => {
    setIsTooltipOpen(true);
  };

  // 处理鼠标离开事件，关闭tooltip
  const handleMouseLeave = () => {
    setIsTooltipOpen(false);
  };

  return (
    <Tooltip
      isOpen={isTooltipOpen}
      placement="top"
      delay={200}
      showArrow={false}
      classNames={{
        content: "py-3 px-2 w-[60px] min-w-[60px]",
      }}
      content={
        <div
          className="flex flex-col items-center gap-1"
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
        >
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
        onPress={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {rate}x
      </Button>
    </Tooltip>
  );
};

export default MusicRate;
