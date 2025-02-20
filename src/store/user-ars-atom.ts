import { atom, useAtom } from "jotai";

import type { ArtistSublistData } from "@/service/artist-sublist";

/**
 * 用户收藏的歌手
 */
export const userArsAtom = atom<ArtistSublistData[] | null>(null);

/**
 * 用户收藏的歌手
 */
export const useUserArs = () => useAtom(userArsAtom);
