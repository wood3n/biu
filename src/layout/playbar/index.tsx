import { useMemo } from "react";

import { RiArrowLeftSLine, RiMusic2Line, RiPauseFill, RiPlayFill } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import Image from "@/components/image";
import { useTheme } from "@/components/theme/use-theme";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import Center from "./center";
import Left from "./left";
import Right from "./right";

/**
 * 播放任务栏（悬浮毛玻璃胶囊），支持折叠/收起
 *
 * 折叠态和展开态共用同一个根 DOM 节点，仅通过条件渲染切换内部子树。
 * 播放状态存储在 zustand store 中，子组件的挂载/卸载不会影响播放进度。
 * init() 已移至 Layout 组件，不会因折叠状态变化而重复调用。
 */
function PlayBar() {
  const playId = usePlayList(s => s.playId);
  const isPlaying = usePlayList(s => s.isPlaying);
  const togglePlay = usePlayList(s => s.togglePlay);
  const list = usePlayList(s => s.list);
  const openFullScreenPlayer = useModalStore(s => s.openFullScreenPlayer);
  const { theme } = useTheme();

  const collapsed = useSettings(s => s.playbarCollapsed);
  const updateSettings = useSettings(s => s.update);

  const isDark = theme === "dark";

  const containerCls = isDark
    ? "border-white/10 bg-[#1b1e22]/60 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.55)]"
    : "border-black/6 bg-white/60 shadow-[0_16px_40px_-14px_rgb(0_0_0/0.18)]";

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);

  // 折叠态：横向小卡片（左侧展开按钮 + 右侧封面叠加播放/暂停）
  if (collapsed) {
    return (
      <div
        className={`flex items-center gap-2 rounded-2xl border p-2 backdrop-blur-2xl transition-all duration-300 ${containerCls}`}
      >
        {/* 左侧：展开按钮 */}
        <IconButton
          radius="full"
          variant="light"
          onPress={() => updateSettings({ playbarCollapsed: false })}
          className="size-9 min-w-9"
          aria-label="展开播放栏"
          tooltip="展开播放栏"
        >
          <RiArrowLeftSLine size={20} />
        </IconButton>

        {/* 右侧：封面 + 叠加播放/暂停按钮 */}
        <div className="group relative cursor-pointer" onClick={() => openFullScreenPlayer()}>
          <Image
            radius="md"
            src={playItem?.pageCover || playItem?.cover}
            width={48}
            height={48}
            params="96w_96h_1c.avif"
            emptyPlaceholder={<RiMusic2Line size={20} />}
          />
          {/* 播放/暂停 overlay */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/30 text-white transition-opacity group-hover:opacity-75"
            onClick={e => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? (
              <RiPauseFill size={20} className="text-white" />
            ) : (
              <RiPlayFill size={20} className="text-white" />
            )}
          </div>
        </div>
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
