import { useEffect, useState } from "react";

import { addToast } from "@heroui/react";
import { RiFileTextLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";

/**
 * 播放条上的桌面歌词开关
 */
const DesktopLyricsButton = () => {
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const open = await window.electron.isDesktopLyricsOpen();
        if (mounted) setVisible(open);
      } catch {
        // 忽略查询失败
      }
    })();

    const removeVisibilityListener = window.electron.onDesktopLyricsVisibilityChange(next => setVisible(next));

    // 锁定时歌词窗不显示任何 UI，所以在这里提示解锁方式
    const removeLockListener = window.electron.onDesktopLyricsLockChange(next => {
      setLocked(next);

      if (next) {
        addToast({
          title: "桌面歌词已锁定（鼠标穿透）",
          description: "不会显示界面、也无法拖动；可在托盘菜单「锁定/解锁桌面歌词」解锁",
          color: "primary",
        });
      }
    });

    return () => {
      mounted = false;
      removeVisibilityListener();
      removeLockListener();
    };
  }, []);

  return (
    <IconButton
      aria-label="桌面歌词"
      className={visible ? (locked ? "text-warning" : "text-primary") : undefined}
      tooltip={visible && locked ? "桌面歌词（已锁定）" : "桌面歌词"}
      onPress={() => {
        void (async () => {
          try {
            const next = await window.electron.toggleDesktopLyrics();
            setVisible(next);
            if (!next) setLocked(false);
          } catch {
            // 忽略切换失败
          }
        })();
      }}
    >
      <RiFileTextLine size={18} />
    </IconButton>
  );
};

export default DesktopLyricsButton;
