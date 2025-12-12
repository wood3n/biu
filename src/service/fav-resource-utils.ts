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

  // 2. 按分区tid过滤
  if (params.tid && params.tid !== 0) {
    // 注意：B站API返回的media对象中可能没有直接的tid字段
    // 这里我们假设API已经按tid过滤，客户端只做二次验证
    // 如果需要客户端过滤，可能需要额外的映射关系
  }

  // 3. 按指定字段排序
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

/**
 * 获取全部收藏夹内容
 * @param mediaId 收藏夹ID
 * @param params 其他参数
 * @returns 全部收藏夹内容
 */
export const getAllFavMedias = async (
  mediaId: string,
  params?: Omit<FavResourceListRequestParams, "media_id" | "ps" | "pn">,
) => {
  const { getFavResourceList } = await import("./fav-resource");

  let allMedias: FavMedia[] = [];
  let page = 1;
  const pageSize = 20;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await getFavResourceList({
        media_id: mediaId,
        ps: pageSize,
        pn: page,
        ...params,
      });

      if (response.data && response.data.medias) {
        allMedias = [...allMedias, ...response.data.medias];
        hasMore = response.data.has_more;
        page++;
      } else {
        hasMore = false;
      }

      // 防止请求过快，添加适当延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return allMedias;
  } catch (error) {
    console.error("获取全部收藏夹内容失败:", error);
    throw error;
  }
};
