import type { PlayDataType } from "@/store/play-list";

export interface MusicPlaylistItem {
  id: string;
  title: string;
  cover: string;
  ownerName: string;
  ownerMid?: number;
  duration: number; // seconds
  playCount?: number;
  addDate?: string; // YYYY-MM-DD or ISO string
  type?: PlayDataType;
  bvid?: string;
  sid?: number;
  cid?: string;
  aid?: string;
  pageTitle?: string;
  pageCover?: string;
  isLossless?: boolean;
  isDolby?: boolean;
}

export interface MusicPlaylistProps {
  items: MusicPlaylistItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showOwner?: boolean;
  showPlayCount?: boolean;
  showAddDate?: boolean;
  className?: string;
  empty?: React.ReactNode;
  displayMode?: "list" | "compact";
}
