import type { WebSearchTypeUserParams } from "@/service/web-interface-search-type";

export type UserSortKey = "default" | "fans_desc" | "fans_asc" | "level_desc" | "level_asc";

export function getSortParams(key: UserSortKey): Pick<WebSearchTypeUserParams, "order" | "order_sort"> {
  switch (key) {
    case "fans_desc":
      return { order: "fans", order_sort: 0 };
    case "fans_asc":
      return { order: "fans", order_sort: 1 };
    case "level_desc":
      return { order: "level", order_sort: 0 };
    case "level_asc":
      return { order: "level", order_sort: 1 };
    default:
      return { order: 0, order_sort: 0 };
  }
}
