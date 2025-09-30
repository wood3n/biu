export enum UserRelation {
  /** 未关注 */
  Unfollowed = 0,
  /** 悄悄关注（已弃用） */
  QuietFollowed = 1,
  /** 已关注 */
  Followed = 2,
  /** 已互粉 */
  MutualFollowed = 6,
  /** 已拉黑 */
  Blocked = 128,
}
