import { RiPauseFill, RiPlayFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";
import clsx from "classnames";

import { formatDuration } from "@/common/utils/time";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";

import IconButton from "../icon-button";
import MusicPlayMode from "../music-play-mode";

/**
 * 毛玻璃播放控件胶囊：循环模式 → 上一曲 → 播放/暂停 → 下一曲 → 时间
 * compact 模式用于封面关闭时（标题栏），高度与窗口控制按钮一致。
 */
const PlayerCapsule = ({ compact = false }: { compact?: boolean }) => {
  const prev = usePlayList(s => s.prev);
  const next = usePlayList(s => s.next);
  const togglePlay = usePlayList(s => s.togglePlay);
  const isPlaying = usePlayList(s => s.isPlaying);
  const list = usePlayList(s => s.list);
  const duration = usePlayList(s => s.duration);
  const currentTime = usePlayProgress(s => s.currentTime);

  const isEmptyPlayList = list.length === 0;
  const isSingle = list.length === 1;

  const prevNextSize = compact ? "size-6 min-w-6" : "size-8 min-w-8";
  const playSize = compact ? "size-7 min-w-7" : "size-10 min-w-10";
  const skipIcon = compact ? 16 : 18;
  const playIcon = compact ? 18 : 20;

  return (
    <div
      className={clsx(
        "window-no-drag flex items-center gap-2 rounded-full border border-white/12 bg-black/25 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] backdrop-blur-2xl",
        compact ? "px-2 py-1 pr-3" : "px-4 py-2 pr-6",
      )}
    >
      <MusicPlayMode />
      <IconButton
        radius="full"
        onPress={prev}
        isDisabled={isEmptyPlayList || isSingle}
        className={clsx(prevNextSize, "text-white")}
      >
        <RiSkipBackFill size={skipIcon} />
      </IconButton>
      <IconButton
        isDisabled={isEmptyPlayList}
        radius="full"
        onPress={togglePlay}
        variant="solid"
        color="primary"
        className={clsx(playSize, "text-white")}
      >
        {isPlaying ? (
          <RiPauseFill size={playIcon} className="text-white" />
        ) : (
          <RiPlayFill size={playIcon} className="text-white" />
        )}
      </IconButton>
      <IconButton
        radius="full"
        onPress={next}
        isDisabled={isEmptyPlayList || isSingle}
        className={clsx(prevNextSize, "text-white")}
      >
        <RiSkipForwardFill size={skipIcon} />
      </IconButton>
      <span
        className={clsx(
          "ml-1 font-medium whitespace-nowrap text-white/80 tabular-nums",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {formatDuration(currentTime)} / {formatDuration(duration ?? 0)}
      </span>
    </div>
  );
};

export default PlayerCapsule;
