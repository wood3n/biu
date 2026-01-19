import type { PlayData } from "@/store/play-list";

export const getDisplayTitle = (data: PlayData): string => {
  return data.pageTitle || data.title || "";
};

export const getDisplayCover = (data: PlayData): string | undefined => {
  return data.pageCover || data.cover || undefined;
};
