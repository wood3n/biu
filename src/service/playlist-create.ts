import request from './request';

export interface PlaylistCreateRequestData {
  name: string | undefined;
  privacy?: number | undefined;
  type: string | undefined;
}

export interface Playlist {
  subscribers?: any[];
  subscribed?: null;
  creator?: null;
  artists?: null;
  tracks?: null;
  updateFrequency?: null;
  backgroundCoverId?: number;
  backgroundCoverUrl?: null;
  titleImage?: number;
  titleImageUrl?: null;
  englishTitle?: null;
  opRecommend?: boolean;
  recommendInfo?: null;
  subscribedCount?: number;
  cloudTrackCount?: number;
  userId?: number;
  totalDuration?: number;
  coverImgId?: number;
  privacy?: number;
  trackUpdateTime?: number;
  trackCount?: number;
  updateTime?: number;
  commentThreadId?: string;
  coverImgUrl?: string;
  specialType?: number;
  anonimous?: boolean;
  createTime?: number;
  highQuality?: boolean;
  newImported?: boolean;
  trackNumberUpdateTime?: number;
  playCount?: number;
  adType?: number;
  description?: null;
  tags?: any[];
  ordered?: boolean;
  status?: number;
  name?: string;
  id?: number;
  coverImgId_str?: string;
  sharedUsers?: null;
  shareStatus?: null;
  copied?: boolean;
}

export interface CreatePlayListRes {
  id: number;
  playlist?: Playlist;
}

/*
 * 新建歌单
 */
export const postPlaylistCreate = (data: PlaylistCreateRequestData) => request.post<APIResponse<CreatePlayListRes>>('/playlist/create', data);
