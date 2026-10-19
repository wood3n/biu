declare global {
  /** 桌面悬浮歌词窗口的展示内容 */
  interface DesktopLyricsPayload {
    /** 设置里是否开启桌面歌词 */
    enabled: boolean;
    /** 是否锁定（鼠标穿透） */
    locked: boolean;
    /** 是否有可显示的内容（正在播放且有歌词行） */
    active: boolean;
    /** 当前歌词行文本 */
    text?: string;
    /** 当前歌词行翻译 */
    translation?: string;
    /** 是否正在播放 */
    isPlaying: boolean;
    /** 当前播放项 id，用于切歌时重置动画 */
    playId?: string;
    /** 当前歌词行下标 */
    index: number;
    /** 字号（px） */
    fontSize: number;
  }

  /** 桌面歌词窗口位置尺寸（DIP） */
  interface DesktopLyricsBounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  /** 桌面歌词开关状态（用于托盘菜单勾选） */
  interface DesktopLyricsWindowState {
    enabled: boolean;
    locked: boolean;
  }
}

export {};
