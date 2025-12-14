/**
 * 收藏夹资源工具函数
 */
import { type FavMedia, type FavResourceListRequestParams } from "./fav-resource";

/**
 * 过滤和排序收藏夹内容
 * @param medias 收藏夹内容列表
 * @param params 过滤和排序参数
 * @returns 过滤和排序后的收藏夹内容列表
 */
export const filterAndSortFavMedias = (
  medias: FavMedia[],
  params: Pick<FavResourceListRequestParams, "keyword" | "tid" | "order">,
): FavMedia[] => {
  let filteredMedias = [...medias];

  // 1. 按关键字过滤
  if (params && params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredMedias = filteredMedias.filter(
      media =>
        media.title.toLowerCase().includes(keyword) || (media.intro && media.intro.toLowerCase().includes(keyword)),
    );
  }

  // 2. 按指定字段排序
  if (params.order) {
    filteredMedias.sort((a, b) => {
      switch (params.order) {
        case "mtime":
          // 按收藏时间排序，最新的在前
          return b.fav_time - a.fav_time;
        case "view":
          // 按播放量排序，播放量高的在前
          return (b.cnt_info.play || 0) - (a.cnt_info.play || 0);
        case "pubtime":
          // 按投稿时间排序，最新的在前
          return b.pubtime - a.pubtime;
        default:
          // 默认按收藏时间排序
          return b.fav_time - a.fav_time;
      }
    });
  }
  return filteredMedias;
};
