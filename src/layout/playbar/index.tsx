import { useMemo } from "react";

import { RiArrowLeftSLine, RiMusic2Line, RiPauseFill, RiPlayFill } from "@remixicon/react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

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
 * 折叠/展开切换时仅做水平拉伸弹回（scaleX spring），无其他特效。
 * 播放状态存储在 zustand store 中，子组件的挂载/卸载不会影响播放进度。
 */

const easeArr = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/** 折叠态：进场带透明度（快 150ms）+ 拉伸弹回（慢 400ms）；出场无透明度 */
const collapsedVariants: Variants = {
  initial: { scaleX: 1, opacity: 0 },
  animate: {
    scaleX: [1.15, 1],
    opacity: 1,
    transition: {
      scaleX: { duration: 0.4, ease: easeArr },
      opacity: { duration: 0.15, ease: "easeOut" },
    },
  },
  exit: { scaleX: 1, opacity: 1, transition: { duration: 0.2, ease: easeArr } },
};

/** 展开态：无透明度，拉伸弹回（快 200ms）；出场带透明度（快 150ms） */
const expandedVariants: Variants = {
  initial: { scaleX: 1, opacity: 1 },
  animate: { scaleX: [1.15, 1], opacity: 1, transition: { duration: 0.2, ease: easeArr } },
  exit: {
    scaleX: 1,
    opacity: 0,
    transition: {
      scaleX: { duration: 0.4, ease: easeArr },
      opacity: { duration: 0.15, ease: "easeOut" },
    },
  },
};

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

  return (
    <AnimatePresence mode="wait" initial={false}>
      {collapsed ? (
        <motion.div
          key="collapsed"
          variants={collapsedVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ transformOrigin: "center" }}
          className={`flex items-center gap-2 rounded-2xl border p-2 backdrop-blur-2xl ${containerCls}`}
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
        </motion.div>
      ) : (
        <motion.div
          key="expanded"
          variants={expandedVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ transformOrigin: "center" }}
          className={`grid h-[84px] grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1.4fr)] items-center gap-4 rounded-2xl border px-6 backdrop-blur-2xl ${containerCls}`}
        >
          <div className="h-full min-w-0">{Boolean(playId) && <Left />}</div>
          <Center />
          <Right />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PlayBar;
