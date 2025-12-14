import { getFavResourceList, type FavResourceListRequestParams } from "@/service/fav-resource";

/** 获取收藏夹中的所有媒体 */
export const getAllFavMedia = async (
  { id: favFolderId, totalCount }: { id: string; totalCount: number },
  searchParams?: Pick<FavResourceListRequestParams, "tid" | "keyword" | "order" | "type">,
) => {
  const FAVORITES_PAGE_SIZE = 20;
  const allResSettled = await Promise.allSettled(
    Array.from({ length: Math.ceil(totalCount / FAVORITES_PAGE_SIZE) }, (_, i) =>
      getFavResourceList({
        media_id: String(favFolderId),
        ps: FAVORITES_PAGE_SIZE,
        pn: i + 1,
        platform: "web",
        ...searchParams,
      }),
    ),
  );

  return allResSettled
    .filter(res => res.status === "fulfilled")
    .map(res => res.value)
    .filter(res => res.code === 0 && res?.data?.medias?.length)
    .flatMap(res =>
      res.data.medias
        .filter(item => item.attr === 0)
        .map(item => {
          if (item.type === 2) {
            return {
              type: "mv" as const,
              bvid: item.bvid,
              title: item.title,
              cover: item.cover,
              ownerMid: item.upper?.mid,
              ownerName: item.upper?.name,
            };
          }
          return {
            type: "audio" as const,
            sid: item.id,
            title: item.title,
            cover: item.cover,
            ownerMid: item.upper?.mid,
            ownerName: item.upper?.name,
          };
        }),
    );
};
