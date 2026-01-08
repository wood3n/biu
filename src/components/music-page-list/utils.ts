import type { PlayData } from "@/store/play-list";

import { formatDuration } from "@/common/utils/time";

export const getDisplayTitle = (data: PlayData): string => {
  return data.pageTitle || data.title || "";
};

export const getDisplayCover = (data: PlayData): string | undefined => {
  return data.pageCover || data.cover || undefined;
};

export const getDurationText = (data: PlayData): string => {
  return data.duration ? formatDuration(data.duration) : "";
};
