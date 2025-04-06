import { RiOrderPlayFill, RiRepeat2Fill, RiRepeatOneFill, RiShuffleFill } from "@remixicon/react";

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
  /**
   * 随机播放
   */
  Random = 3,
}

export const PlayModeDesc = {
  [PlayMode.Sequential]: "顺序播放",
  [PlayMode.Single]: "单曲循环",
  [PlayMode.Loop]: "循环播放",
  [PlayMode.Random]: "随机播放",
};

export const PlayBarStyle = {
  MainPlayIconSize: 48,
  SecondIconSize: 22,
  SideIconSize: 20,
};

export const PlayModeIcon = {
  [PlayMode.Sequential]: <RiOrderPlayFill size={PlayBarStyle.SideIconSize} />,
  [PlayMode.Loop]: <RiRepeat2Fill size={PlayBarStyle.SideIconSize} />,
  [PlayMode.Single]: <RiRepeatOneFill size={PlayBarStyle.SideIconSize} />,
  [PlayMode.Random]: <RiShuffleFill size={PlayBarStyle.SideIconSize} />,
};

export const PlayRate = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
