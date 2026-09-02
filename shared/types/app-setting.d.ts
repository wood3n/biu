type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type ThemeMode = "system" | "light" | "dark";
type PageTransition = "none" | "fade" | "slide" | "scale" | "slideUp";

type ProxyType = "none" | "http" | "socks4" | "socks5";

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
}
