import { getFavResourceIds } from "@/service/fav-resource";
import { getFavResourceInfos } from "@/service/fav-resource-infos";

/** 获取收藏夹中的所有媒体 */
export const getAllFavMedia = async ({ id: favFolderId }: { id: string }) => {
  const idsRes = await getFavResourceIds({
    media_id: Number(favFolderId),
    platform: "web",
  });

  if (idsRes.code !== 0 || !idsRes.data) {
    return [];
  }

  const allIds = idsRes.data;
  if (allIds.length === 0) {
    return [];
  }

  const resources = allIds.map(item => `${item.id}:${item.type}`).join(",");
  const res = await getFavResourceInfos({ resources, platform: "web" });

  if (res.code !== 0 || !res.data) {
    return [];
  }

  return (res.data || [])
    .filter(item => item.attr === 0)
    .map(item => {
      if (item.type === 2) {
        return {
          type: "mv" as const,
          bvid: item.bvid || item.bv_id,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
          sid: 0, // 添加缺失的属性以匹配类型
        };
      }
      return {
        type: "audio" as const,
        sid: item.id,
        title: item.title,
        cover: item.cover,
        ownerMid: item.upper?.mid,
        ownerName: item.upper?.name,
        bvid: "", // 添加缺失的属性以匹配类型
      };
    });
};
