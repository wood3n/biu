import { useEffect } from "react";

import { RiArrowUpSLine, RiPauseFill, RiPlayFill } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import { useTheme } from "@/components/theme/use-theme";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import Center from "./center";
import Left from "./left";
import Right from "./right";

/**
 * 播放任务栏（悬浮毛玻璃胶囊），支持折叠/收起
 */
function PlayBar() {
  const playId = usePlayList(s => s.playId);
  const init = usePlayList(s => s.init);
  const isPlaying = usePlayList(s => s.isPlaying);
  const togglePlay = usePlayList(s => s.togglePlay);
  const { theme } = useTheme();

  const collapsed = useSettings(s => s.playbarCollapsed);
  const updateSettings = useSettings(s => s.update);

  useEffect(() => {
    init();
  }, [init]);

  const isDark = theme === "dark";

  const containerCls = isDark
    ? "border-white/10 bg-[#1b1e22]/60 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.55)]"
    : "border-black/6 bg-white/60 shadow-[0_16px_40px_-14px_rgb(0_0_0/0.18)]";

  // 折叠态：右下角悬浮圆按钮（播放/暂停），双击或长按展开
  if (collapsed) {
    return (
      <div className="flex items-center gap-2">
        <IconButton
          isDisabled={!playId}
          radius="full"
          onPress={togglePlay}
          variant="solid"
          color="primary"
          className="size-11 min-w-11 text-white"
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <RiPauseFill size={20} className="text-white" />
          ) : (
            <RiPlayFill size={20} className="text-white" />
          )}
        </IconButton>
        <IconButton
          radius="full"
          variant="light"
          onPress={() => updateSettings({ playbarCollapsed: false })}
          className="size-8 min-w-8"
          aria-label="展开播放栏"
          tooltip="展开播放栏"
        >
          <RiArrowUpSLine size={18} />
        </IconButton>
      </div>
    );
  }

  // 展开态：完整三栏播放栏
  return (
    <div
      className={`grid h-[84px] grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1.4fr)] items-center gap-4 rounded-2xl border px-6 backdrop-blur-2xl transition-all duration-300 ${containerCls}`}
    >
      <div className="h-full min-w-0">{Boolean(playId) && <Left />}</div>
      <Center />
      <Right />
    </div>
  );
}

export default PlayBar;
