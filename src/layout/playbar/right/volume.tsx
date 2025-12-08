import React, { useRef, useState, useEffect } from "react";

import { Button, Tooltip, Slider } from "@heroui/react";
import { RiVolumeDownLine, RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";

import { PlayBarIconSize } from "../constants";

const Volume = () => {
  const volume = usePlayList(s => s.volume);
  const isMuted = usePlayList(s => s.isMuted);
  const toggleMute = usePlayList(s => s.toggleMute);
  const setVolume = usePlayList(s => s.setVolume);

  const previousVolume = useRef(volume);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [showTooltipOnScroll, setShowTooltipOnScroll] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onVolumeChange = (val: number) => {
    if (isMuted) {
      toggleMute();
    }
    if (val === 0) {
      toggleMute();
    }
    setVolume(val);
  };

  const onToggleMute = () => {
    if (!isMuted) {
      previousVolume.current = volume;
      setVolume(0);
      // 静音时关闭音量条
      setIsTooltipOpen(false);
    } else {
      setVolume(previousVolume.current);
      // 取消静音时，设置标志允许滚动显示音量条
      setShowTooltipOnScroll(true);
    }
    toggleMute();
  };

  const onWheel = (event: React.WheelEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 阻止默认滚动行为

    // 如果当前是静音状态，先取消静音
    if (isMuted) {
      toggleMute();
      // 取消静音时，设置标志允许滚动显示音量条
      setShowTooltipOnScroll(true);
    }

    // 如果设置了显示标志，显示音量条
    if (showTooltipOnScroll) {
      setIsTooltipOpen(true);

      // 清除之前的定时器
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }

      // 设置3秒后自动隐藏音量条
      tooltipTimerRef.current = setTimeout(() => {
        setIsTooltipOpen(false);
        setShowTooltipOnScroll(false);
      }, 3000);
    }

    // 计算音量变化量，根据滚轮方向调整
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    let newVolume = volume + delta;

    // 确保音量在0-1范围内
    newVolume = Math.max(0, Math.min(1, newVolume));

    // 更新音量
    setVolume(newVolume);

    // 如果音量变为0，设置为静音状态
    if (newVolume === 0) {
      toggleMute();
      setIsTooltipOpen(false);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  const tooltipId = "volume-tooltip";

  return (
    <Tooltip
      id={tooltipId}
      placement="top"
      delay={300}
      showArrow={false}
      shouldCloseOnBlur={false}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
      content={
        <div className="flex items-center justify-center p-3">
          <Slider
            disableAnimation
            aria-label="音量"
            color="primary"
            radius="full"
            size="sm"
            orientation="vertical"
            value={volume}
            minValue={0}
            maxValue={1}
            step={0.01}
            // @ts-expect-error volume is number
            onChange={onVolumeChange}
            classNames={{
              trackWrapper: "h-40 w-[32px]",
              thumb: "after:hidden",
            }}
            endContent={
              <span className="text-foreground/60 w-8 text-center text-xs tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            }
          />
        </div>
      }
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="hover:text-primary"
        onPress={onToggleMute}
        onWheel={onWheel}
        aria-label={isMuted ? "取消静音" : "静音"}
        aria-describedby={tooltipId}
      >
        {isMuted ? (
          <RiVolumeMuteLine size={PlayBarIconSize.SideIconSize} />
        ) : volume > 0.5 ? (
          <RiVolumeUpLine size={PlayBarIconSize.SideIconSize} />
        ) : (
          <RiVolumeDownLine size={PlayBarIconSize.SideIconSize} />
        )}
      </Button>
    </Tooltip>
  );
};

export default Volume;
