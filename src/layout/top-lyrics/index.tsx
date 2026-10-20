import { useEffect, useMemo } from "react";

import { RiCloseLine, RiMusic2Line } from "@remixicon/react";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import IconButton from "@/components/icon-button";
import { getActiveLyricIndex, getLyricsCacheKey, useLyricsStore } from "@/store/lyrics";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";

/**
 * 主窗口顶部的常驻歌词栏
 *
 * 显示当前播放歌曲的当前歌词行（有翻译时一并显示），点击歌词区域可打开全屏播放器。
 * 本地音乐/普通音频没有歌词来源，此时不显示歌词栏。
 */
const TopLyrics = () => {
  const showTopLyrics = useSettings(s => s.showTopLyrics);
  const showTopLyricsTranslation = useSettings(s => s.showTopLyricsTranslation);
  const updateSettings = useSettings(s => s.update);
  const isFullScreenPlayerOpen = useModalStore(s => s.isFullScreenPlayerOpen);
  const openFullScreenPlayer = useModalStore(s => s.openFullScreenPlayer);
  const playId = usePlayList(s => s.playId);
  const playItem = usePlayList(s => s.list.find(item => item.id === s.playId));
  const { lyrics, translatedLyrics, offset, isLoading, isLoaded } = useLyricsStore(
    useShallow(s => ({
      lyrics: s.lyrics,
      translatedLyrics: s.translatedLyrics,
      offset: s.offset,
      isLoading: s.isLoading,
      isLoaded: s.isLoaded,
    })),
  );
  const currentTime = usePlayProgress(s => s.currentTime);

  const cacheKey = getLyricsCacheKey(playItem?.bvid, playItem?.cid);

  useEffect(() => {
    if (!showTopLyrics) return;
    void useLyricsStore.getState().load();
  }, [playId, showTopLyrics]);

  const translationMap = useMemo(() => {
    const map = new Map<number, string>();
    translatedLyrics.forEach(item => map.set(item.time, item.text));
    return map;
  }, [translatedLyrics]);

  const activeIndex = getActiveLyricIndex(lyrics, currentTime * 1000 + offset);
  // 还没唱到第一句时，把第一句当作「即将播放」的内容显示
  const index = activeIndex >= 0 ? activeIndex : lyrics.length ? 0 : -1;
  const line = index >= 0 ? lyrics[index] : undefined;
  const translation = line ? translationMap.get(line.time) : undefined;
  const isPending = !line && (isLoading || !isLoaded);

  if (!showTopLyrics || !playItem || !cacheKey || isFullScreenPlayerOpen) return null;

  const contentKey = line ? `${playId}-${index}` : isPending ? "loading" : "empty";

  return (
    <div className="border-divider/30 bg-background/80 flex h-12 w-full flex-none items-center border-b pr-2 pl-4 backdrop-blur-md select-none">
      <RiMusic2Line size={16} className="text-primary mr-3 shrink-0" />
      <div
        role="button"
        tabIndex={0}
        aria-label="打开全屏播放器"
        title="点击打开全屏播放器"
        className="relative flex h-full min-w-0 flex-1 cursor-pointer items-center overflow-hidden"
        onClick={openFullScreenPlayer}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFullScreenPlayer();
          }
        }}
      >
        <motion.div
          key={contentKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex h-full min-w-0 flex-col items-center justify-center"
        >
          {line ? (
            <>
              <span className="text-foreground max-w-full truncate text-sm leading-tight font-medium">{line.text}</span>
              {showTopLyricsTranslation && translation ? (
                <span className="text-foreground-500 mt-0.5 max-w-full truncate text-xs leading-tight">
                  {translation}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-foreground-500 text-xs">{isPending ? "歌词加载中..." : "暂无歌词"}</span>
          )}
        </motion.div>
      </div>
      <div className="ml-2 flex shrink-0 items-center">
        <IconButton
          tooltip="隐藏顶部歌词"
          className="h-7 w-7 min-w-0"
          onPress={() => updateSettings({ showTopLyrics: false })}
        >
          <RiCloseLine size={16} />
        </IconButton>
      </div>
    </div>
  );
};

export default TopLyrics;
