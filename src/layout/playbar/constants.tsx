import { RiRepeat2Fill, RiRepeatOneFill, RiShuffleFill } from "@remixicon/react";

import { PlayMode } from "@/common/constants";

export const PlayBarIconSize = {
  MainControlIconSize: 48,
  SecondControlIconSize: 22,
  ThirdControlIconSize: 18,
  SideIconSize: 20,
};

export const PlayModeIcon = {
  [PlayMode.Loop]: <RiRepeat2Fill size={PlayBarIconSize.ThirdControlIconSize} />,
  [PlayMode.Single]: <RiRepeatOneFill size={PlayBarIconSize.ThirdControlIconSize} />,
  [PlayMode.Random]: <RiShuffleFill size={PlayBarIconSize.ThirdControlIconSize} />,
};

export const PlayRate = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** 播放状态持久化 */
export enum PlayState {
  Playlist = "playlist",
  Song = "song",
  Progress = "progress",
  Volume = "volume",
  Rate = "rate",
  PlayMode = "play_mode",
  IsRandom = "is_random",
}
