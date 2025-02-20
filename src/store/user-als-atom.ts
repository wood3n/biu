import { atom, useAtom } from "jotai";

import type { AlbumSublistData } from "@/service/album-sublist";

/**
 * 用户收藏的专辑
 */
export const userAlsAtom = atom<AlbumSublistData[] | null>(null);

/**
 * 用户收藏的专辑
 */
export const useUserAls = () => useAtom(userAlsAtom);
