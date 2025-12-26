type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type ThemeMode = "light" | "dark";
type PageTransition = "none" | "fade" | "slide" | "scale" | "slideUp";

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
  enableWaveformOnClick: boolean;
  themeMode: ThemeMode;
  pageTransition: PageTransition;
  searchMusicOnly: boolean;
  showSearchHistory: boolean;
}
