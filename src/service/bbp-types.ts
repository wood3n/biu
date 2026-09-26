/**
 * BBPlayer 自建后端 API 类型定义
 * @see HTTPAPI.md 第 1~17 节
 */

/** BBPlayer 账号 */
export interface BBPAccount {
  id: string;
  username: string;
  name: string;
  face: string | null;
}

/** 鉴权响应（注册 / 登录） */
export interface BBPAuthResponse {
  token: string;
  account: BBPAccount;
}

/** 当前用户信息响应（/auth/me、/auth/profile） */
export interface BBPAccountResponse {
  account: BBPAccount;
}

/** 健康检查响应 */
export interface BBPHealthResponse {
  status: string;
  timestamp: number;
}

/** /me/playlists 返回项（camelCase！） */
export interface BBPPlaylistSummary {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  updatedAt: number;
  role: "owner" | "editor" | "subscriber";
  joinedAt: number;
}

/** /me/playlists 响应 */
export interface BBPMePlaylistsResponse {
  playlists: BBPPlaylistSummary[];
}

/** 歌单预览中的曲目（snake_case） */
export interface BBPTrack {
  unique_key: string;
  title: string;
  artist_name: string;
  artist_id: string | null;
  cover_url: string | null;
  duration: number;
  bilibili_bvid: string;
  bilibili_cid: string;
  sort_key: string;
}

/** 歌单预览中的歌单元信息 */
export interface BBPPlaylistPreviewInfo {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_at: number;
  updated_at: number;
  track_count: number;
}

/** 歌单预览中的 owner 信息 */
export interface BBPPlaylistPreviewOwner {
  account_id: string;
  name: string;
  avatar_url: string | null;
}

/** 歌单预览响应 */
export interface BBPPlaylistPreview {
  playlist: BBPPlaylistPreviewInfo;
  owner: BBPPlaylistPreviewOwner;
  tracks: BBPTrack[];
  preview_limit: number;
}

/** 创建歌单请求中的曲目 */
export interface BBPTrackInput {
  unique_key: string;
  title: string;
  artist_name: string;
  artist_id?: string | null;
  cover_url?: string | null;
  duration?: number;
  bilibili_bvid: string;
  bilibili_cid: string;
}

/** 创建歌单请求中的曲目项（带 sort_key） */
export interface BBPTrackInputItem {
  track: BBPTrackInput;
  sort_key: string;
}

/** 歌单元信息（snake_case，/playlists/:id 返回） */
export interface BBPPlaylistDetail {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  editor_invite_code: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** 歌单详情响应 */
export interface BBPPlaylistDetailResponse {
  playlist: BBPPlaylistDetail;
}

/** 变更操作 */
export interface BBPChange {
  op: "upsert" | "remove" | "reorder";
  track?: BBPTrackInput;
  track_unique_key?: string;
  sort_key?: string;
  operation_at?: number;
}

/** 变更拉取响应中的曲目项 */
export interface BBPChangesTrack {
  op: "upsert" | "delete";
  track?: BBPTrack;
  track_unique_key?: string;
  sort_key?: string;
  updated_at?: number;
  deleted_at?: number;
}

/** 成员 */
export interface BBPMember {
  account_id: string;
  role: "owner" | "editor" | "subscriber";
  name: string;
  avatar_url: string | null;
  joined_at?: number;
}

/** 变更拉取响应 */
export interface BBPChangesResponse {
  metadata: {
    title: string;
    description: string;
    cover_url: string;
    updated_at: number;
  } | null;
  tracks: BBPChangesTrack[];
  members: BBPMember[];
  has_more: boolean;
  server_time: number;
}

/** 订阅响应 */
export interface BBPSubscribeResponse {
  role: "owner" | "editor" | "subscriber";
  already_member: boolean;
  upgraded?: boolean;
}

/** 邀请码响应 */
export interface BBPInviteCodeResponse {
  editor_invite_code: string;
}

/** 删除歌单响应 */
export interface BBPPlaylistDeleteResponse {
  deleted: boolean;
}

/** 成员列表响应 */
export interface BBPPlaylistMembersResponse {
  members: BBPMember[];
}

/** 退出歌单响应 */
export interface BBPPlaylistLeaveResponse {
  removed: boolean;
}
