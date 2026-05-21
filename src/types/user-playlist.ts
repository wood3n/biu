import type { PlayItem } from "@/store/play-list";

export interface UserPlaylistItem {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  songs: PlayItem[];
}
