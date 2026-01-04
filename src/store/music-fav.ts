import { create } from "zustand";

import { getCollResourceCheck } from "@/service/medialist-gateway-coll-resource-check";
import { getWebInterfaceArchiveRelation } from "@/service/web-interface-archive-relation";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

interface State {
  isFav: boolean;
}

interface Action {
  setIsFav: (value: boolean) => void;
  refreshIsFav: () => Promise<void>;
}

export const useMusicFavStore = create<State & Action>()(set => ({
  isFav: false,
  setIsFav: value => {
    set({ isFav: value });
  },
  refreshIsFav: async () => {
    const user = useUser.getState().user;
    const playItem = usePlayList.getState().getPlayItem();

    if (!user?.isLogin || !playItem) {
      set({ isFav: false });
      return;
    }

    if (playItem.type === "mv" && playItem.bvid) {
      const res = await getWebInterfaceArchiveRelation({ bvid: playItem.bvid });

      if (res.code === 0) {
        set({ isFav: Boolean(res.data.favorite) });
      } else {
        set({ isFav: false });
      }
    } else if (playItem.type === "audio" && playItem.sid) {
      const res = await getCollResourceCheck({
        rid: playItem.sid,
        type: 12,
      });

      if (res.code === 0) {
        set({ isFav: Boolean(res.data) });
      } else {
        set({ isFav: false });
      }
    } else {
      set({ isFav: false });
    }
  },
}));
