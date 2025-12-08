import { RiOrderPlayLine, RiRepeat2Line, RiRepeatOneLine, RiShuffleLine } from "@remixicon/react";

/**
 * 播放模式
 */
export enum PlayMode {
  /**
   * 顺序播放
   */
  Sequence = 1,
  /**
   * 循环播放
   */
  Loop = 2,
  /**
   * 随机播放
   */
  Random = 3,
  /**
   * 单曲播放
   */
  Single = 4,
}

export const getPlayModeList = (iconSize?: number) => [
  {
    value: PlayMode.Sequence,
    desc: "顺序播放",
    icon: <RiOrderPlayLine size={iconSize} />,
  },
  {
    value: PlayMode.Loop,
    desc: "循环播放",
    icon: <RiRepeat2Line size={iconSize} />,
  },
  {
    value: PlayMode.Random,
    desc: "随机播放",
    icon: <RiShuffleLine size={iconSize} />,
  },
  {
    value: PlayMode.Single,
    desc: "单曲播放",
    icon: <RiRepeatOneLine size={iconSize} />,
  },
];
