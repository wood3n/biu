type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type ThemeMode = "system" | "light" | "dark";
type PageTransition = "none" | "fade" | "slide" | "scale" | "slideUp";

type ProxyType = "none" | "http" | "socks4" | "socks5";

/** 悬浮窗底板样式，顺序即设置页 Tab 顺序 */
type MiniPlayerBackdrop = "acrylic" | "light" | "dark";

interface ProxySettings {
  type: ProxyType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

interface AppSettings {
  fontFamily: string;
  primaryColor: string;
  /** 自定义背景色（为空表示使用主题默认） */
  backgroundColor: string;
  borderRadius: number;
  downloadPath?: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
  audioQuality: AudioQuality;
  hiddenMenuKeys: string[];
  displayMode: "card" | "list" | "compact";
  ffmpegPath?: string;
  themeMode: ThemeMode;
  pageTransition: PageTransition;
  showSearchHistory: boolean;
  proxySettings: ProxySettings;
  sideMenuCollapsed: boolean;
  sideMenuWidth: number;
  sideMenuCollectionFolded: {
    created: boolean;
    collected: boolean;
  };
  reportPlayHistory: boolean;
  /** 本地音乐目录列表 */
  localMusicDirs: string[];
  /** 歌词翻译显示开关 */
  showLyricsTranslation: boolean;
  /** 歌词假名注音开关 */
  showLyricsFurigana: boolean;
  /** 播放栏折叠状态 */
  playbarCollapsed: boolean;
  /** 侧边栏收起时垂直居中 */
  sideMenuCollapsedCenter: boolean;
  /** 窗口七彩跑马灯开关（BPM 联动） */
  marqueeEnabled: boolean;
  /** 频谱与节拍检测每秒最多重绘多少次（rAF 按刷新率发帧，此处做上限门控） */
  animationFps: number;
  /** 桌面歌词开关 */
  desktopLyricsEnabled: boolean;
  /** 桌面歌词锁定：锁定后整条鼠标穿透，不可拖动 */
  desktopLyricsLocked: boolean;
  /** 桌面歌词字号（px） */
  desktopLyricsFontSize: number;
  /** 桌面歌词字体（CSS font-family 值，"system-ui" 为系统默认） */
  desktopLyricsFontFamily: string;
  /** 桌面歌词未唱部分文字颜色 */
  desktopLyricsColor: string;
  /** 桌面歌词已唱部分文字颜色 */
  desktopLyricsActiveColor: string;
  /** 桌面歌词行数：单行只显示当前句，双行同时显示当前句与下一句并上下轮换所在行 */
  desktopLyricsLineMode: "single" | "double";
  /** 桌面歌词一行最多占多少屏幕宽度（百分比）。超出即起跑马灯，不写死成整屏宽 */
  desktopLyricsWidth: number;
  /** 悬浮窗底板：acrylic=系统亚克力（DWM 实时糊桌面），light/dark=纯色实心面板 */
  miniPlayerBackdrop: MiniPlayerBackdrop;
}
