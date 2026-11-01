import { useEffect, useState } from "react";

import { useModalStore } from "@/store/modal";

/** 全屏播放器入场动画时长（HeroUI Drawer 约 300ms），留一点余量再判定「已经盖住了」 */
const COVER_DELAY_MS = 450;

/**
 * 全屏播放器是否已经把主界面整个盖住。
 *
 * 打开后导航栏/播放栏/页面内容都在抽屉底下看不见了，但 Chromium 不知道：
 * 它们照样每帧合成，其中导航栏 + 播放栏还各挂着一层 `backdrop-blur-2xl`（合计约 15 万像素/帧）。
 * 所以等入场动画结束再把那棵子树 `invisible`（visibility 不参与绘制，backdrop-filter 也就不跑了），
 * 关闭时立刻恢复 —— 抽屉滑下去的过程中底下必须还是原样，否则会看到闪一下。
 */
export function useFullScreenCovered() {
  const isOpen = useModalStore(s => s.isFullScreenPlayerOpen);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCovered(false);
      return;
    }
    const timer = setTimeout(() => setCovered(true), COVER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return covered;
}
