import type { BBPTrack } from "@/service/bbp-types";
import type { PlayItem } from "@/store/play-list";

/** 将 BBPTrack 转换为 PlayItem */
export const bbpTrackToPlayItem = (track: BBPTrack): PlayItem => ({
  type: "mv",
  bvid: track.bilibili_bvid,
  title: track.title,
  cover: track.cover_url ?? undefined,
  ownerName: track.artist_name,
});

/** 批量转换 */
export const bbpTracksToPlayItems = (tracks: BBPTrack[]): PlayItem[] => tracks.map(bbpTrackToPlayItem);
