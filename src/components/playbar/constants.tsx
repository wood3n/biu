import { RiOrderPlayFill, RiRepeat2Fill, RiRepeatOneFill } from "@remixicon/react";

/**
 * 播放模式
 */
export enum PlayMode {
  /**
   * 顺序播放
   */
  Sequential = 0,
  /**
   * 单曲循环
   */
  Single = 1,
  /**
   * 循环播放
   */
  Loop = 2,
}

export const PlayModeDesc = {
  [PlayMode.Sequential]: "顺序播放",
  [PlayMode.Single]: "单曲循环",
  [PlayMode.Loop]: "循环播放",
};

export const PlayBarStyle = {
  MainControlIconSize: 48,
  SecondControlIconSize: 22,
  ThirdControlIconSize: 18,
  SideIconSize: 20,
};

export const PlayModeIcon = {
  [PlayMode.Sequential]: <RiOrderPlayFill size={PlayBarStyle.ThirdControlIconSize} />,
  [PlayMode.Loop]: <RiRepeat2Fill size={PlayBarStyle.ThirdControlIconSize} />,
  [PlayMode.Single]: <RiRepeatOneFill size={PlayBarStyle.ThirdControlIconSize} />,
};

export const PlayRate = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** 播放状态持久化 */
export enum PlayState {
  Song = "song",
  Progress = "progress",
  Volume = "volume",
  Rate = "rate",
  PlayMode = "play_mode",
  IsRandom = "is_random",
}
