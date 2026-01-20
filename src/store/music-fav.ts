import { create } from "zustand";

import { getCollResourceCheck } from "@/service/medialist-gateway-coll-resource-check";
import { getWebInterfaceArchiveRelation } from "@/service/web-interface-archive-relation";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

interface State {
  isThumb: boolean;
  isFav: boolean;
}

interface Action {
  setIsFav: (value: boolean) => void;
  setIsThumb: (value: boolean) => void;
  refreshIsFav: () => Promise<void>;
}

export const useMusicFavStore = create<State & Action>()(set => ({
  isThumb: false,
  isFav: false,
  setIsFav: value => {
    set({ isFav: value });
  },
  setIsThumb: value => {
    set({ isThumb: value });
  },
  refreshIsFav: async () => {
    const user = useUser.getState().user;
    const playItem = usePlayList.getState().getPlayItem();

    if (!user?.isLogin || !playItem) {
      set({ isFav: false, isThumb: false });
      return;
    }

    try {
      if (playItem.type === "mv" && playItem.bvid) {
        const res = await getWebInterfaceArchiveRelation({ bvid: playItem.bvid });

        if (res.code === 0) {
          set({ isFav: Boolean(res.data.favorite), isThumb: Boolean(res.data.like) });
        } else {
          set({ isFav: false, isThumb: false });
        }
      } else if (playItem.type === "audio" && playItem.sid) {
        const res = await getCollResourceCheck({
          rid: playItem.sid,
          type: 12,
        });

        if (res.code === 0) {
          set({ isFav: Boolean(res.data), isThumb: false });
        } else {
          set({ isFav: false, isThumb: false });
        }
      } else {
        set({ isFav: false, isThumb: false });
      }
    } catch {
      set({ isFav: false });
    }
  },
}));
