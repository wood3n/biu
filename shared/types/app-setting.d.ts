type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type LyricsProvider = "netease" | "custom";
type LyricsTitleResolverProvider = "custom" | "ark";

interface AppSettings {
  fontFamily: string;
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  borderRadius: number;
  downloadPath?: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
  audioQuality: AudioQuality;
  hiddenMenuKeys: string[];
  displayMode: "card" | "list";
  ffmpegPath?: string;

  /** 桌面歌词：是否启用 */
  lyricsOverlayEnabled: boolean;
  /** 桌面歌词：播放时自动打开 */
  lyricsOverlayAutoShow: boolean;
  /** 歌词来源 */
  lyricsProvider: LyricsProvider;
  /** 网易云：搜索 URL 模板（占位符：{query}） */
  neteaseSearchUrlTemplate: string;
  /** 网易云：歌词 URL 模板（占位符：{id}） */
  neteaseLyricUrlTemplate: string;
  /** 是否启用“歌名纠正”（通过外部 AI/服务解析真实歌名，并做本地缓存） */
  lyricsTitleResolverEnabled: boolean;
  /** 歌名纠正提供方 */
  lyricsTitleResolverProvider: LyricsTitleResolverProvider;
  /** Ark：API Key（可为空） */
  lyricsArkApiKey: string;
  /** Ark：模型名 */
  lyricsArkModel: string;
  /** Ark：API Endpoint */
  lyricsArkEndpoint: string;
  /** Ark：reasoning_effort */
  lyricsArkReasoningEffort: string;
  /**
   * 歌名纠正 URL 模板，支持占位符：
   * - {title}：标题
   * - {artist}：作者/歌手
   * - {query}：title + artist 组合
   */
  lyricsTitleResolverUrlTemplate: string;
  /**
   * 歌词查询 URL 模板，支持占位符：
   * - {title}：标题
   * - {artist}：作者/歌手
   * - {query}：title + artist 组合
   */
  lyricsApiUrlTemplate: string;
  /** 桌面歌词：字体大小（px） */
  lyricsOverlayFontSize: number;
  /** 桌面歌词：透明度（0-1） */
  lyricsOverlayOpacity: number;
  /** 桌面歌词：显示区域最大宽度（px） */
  lyricsOverlayContentMaxWidth: number;
  /** 桌面歌词：显示区域高度（px） */
  lyricsOverlayContentHeight: number;
  /** 桌面歌词：窗口宽度（px） */
  lyricsOverlayWindowWidth: number;
  /** 桌面歌词：窗口高度（px） */
  lyricsOverlayWindowHeight: number;
  /** 桌面歌词：背景颜色（hex，例如 #000000） */
  lyricsOverlayBackgroundColor: string;
  /** 桌面歌词：背景不透明度（0-1，只影响背景层） */
  lyricsOverlayBackgroundOpacity: number;
  /** 桌面歌词：字体颜色（hex，例如 #ffffff） */
  lyricsOverlayFontColor: string;
  /** 桌面歌词：字体透明度（0-1） */
  lyricsOverlayFontOpacity: number;
  /** 桌面歌词：显示行数（包含当前行） */
  lyricsOverlayVisibleLines: number;
  /** 桌面歌词：设置面板位置 X */
  lyricsOverlayPanelX: number;
  /** 桌面歌词：设置面板位置 Y */
  lyricsOverlayPanelY: number;
}
