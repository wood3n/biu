import React, { useRef, useState, useEffect, useCallback } from "react";

import { Button, Tooltip, Slider } from "@heroui/react";
import { RiVolumeDownLine, RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";

const Volume = () => {
  const volume = usePlayList(s => s.volume);
  const isMuted = usePlayList(s => s.isMuted);
  const toggleMute = usePlayList(s => s.toggleMute);
  const setVolume = usePlayList(s => s.setVolume);

  const previousVolume = useRef(volume);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const setSliderRef = useCallback((node: HTMLDivElement | null) => {
    if (sliderRef.current) {
      sliderRef.current.removeEventListener("wheel", onWheel);
    }
    sliderRef.current = node;
    if (node) {
      node.addEventListener("wheel", onWheel, { passive: false });
    }
  }, []);

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
    }
    toggleMute();
  };

  const onWheel = useCallback((event: WheelEvent) => {
    event.preventDefault(); // 阻止默认滚动行为

    const state = usePlayList.getState();
    const { volume, isMuted, toggleMute, setVolume } = state;

    // 如果当前是静音状态，先取消静音
    if (isMuted) {
      toggleMute();
    }

    // 显示音量条
    setIsTooltipOpen(true);

    // 清除之前的定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }

    // 设置3秒后自动隐藏音量条
    tooltipTimerRef.current = setTimeout(() => {
      setIsTooltipOpen(false);
    }, 3000);

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
  }, []);

  // 清理定时器
  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      button.addEventListener("wheel", onWheel, { passive: false });
    }

    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
      if (button) {
        button.removeEventListener("wheel", onWheel);
      }
    };
  }, [onWheel]);

  const tooltipId = "volume-tooltip";

  return (
    <Tooltip
      disableAnimation
      id={tooltipId}
      placement="top"
      delay={300}
      showArrow={false}
      triggerScaleOnOpen={false}
      shouldCloseOnBlur={false}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
      content={
        <div ref={setSliderRef} className="flex items-center justify-center p-3">
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
        ref={buttonRef}
        isIconOnly
        size="sm"
        variant="light"
        className="hover:text-primary"
        onPress={onToggleMute}
        aria-label={isMuted ? "取消静音" : "静音"}
        aria-describedby={tooltipId}
      >
        {isMuted ? (
          <RiVolumeMuteLine size={18} />
        ) : volume > 0.5 ? (
          <RiVolumeUpLine size={18} />
        ) : (
          <RiVolumeDownLine size={18} />
        )}
      </Button>
    </Tooltip>
  );
};

export default Volume;
