declare global {
  interface DesktopLyricsBounds {
    x?: number;
    y?: number;
    width: number;
    height: number;
  }

  /** 桌面歌词窗口设置 */
  interface DesktopLyricsSettings {
    /** 窗口位置与尺寸 */
    bounds: DesktopLyricsBounds;
    /** 是否显示背景板 */
    background: boolean;
    /** 当前歌词字号（px） */
    fontSize: number;
    /** 是否锁定（锁定后鼠标穿透、不显示工具栏；把鼠标移到歌词上可从右上角解锁） */
    locked: boolean;
    /** 歌词整体不透明度 0.3 - 1 */
    opacity: number;
    /** 是否显示翻译歌词 */
    showTranslation: boolean;
    /** 上次退出时窗口是否处于显示状态，用于启动时恢复 */
    visible: boolean;
  }

  /** 渲染进程可修改的桌面歌词样式（不包含窗口状态） */
  type DesktopLyricsStyle = Pick<DesktopLyricsSettings, "background" | "fontSize" | "opacity" | "showTranslation">;
}

export {};
