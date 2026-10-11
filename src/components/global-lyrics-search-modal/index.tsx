import { useCallback } from "react";

import { notifyLyricsUpdated } from "@/common/utils/desktop-lyrics";
import LyricsSearchModal from "@/components/lyrics-search-modal";
import { useLyricsSearchStore } from "@/store/lyrics-search";

/**
 * 挂在应用根部的歌词搜索弹窗。
 * 除了播放页里的入口，桌面歌词窗口的「选歌词」也通过它唤起（主界面才有足够空间展示列表）。
 */
const GlobalLyricsSearchModal = () => {
  const isOpen = useLyricsSearchStore(s => s.isOpen);
  const setOpen = useLyricsSearchStore(s => s.setOpen);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
    },
    [setOpen],
  );

  const handleAdopted = useCallback(() => {
    // 手动选好歌词后，通知桌面歌词窗口立即刷新
    notifyLyricsUpdated();
  }, []);

  return <LyricsSearchModal isOpen={isOpen} onOpenChange={handleOpenChange} onLyricsAdopted={handleAdopted} />;
};

export default GlobalLyricsSearchModal;
