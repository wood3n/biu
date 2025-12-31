type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type ThemeMode = "system" | "light" | "dark";
type PageTransition = "none" | "fade" | "slide" | "scale" | "slideUp";

interface AppSettings {
  fontFamily: string;
  primaryColor: string;
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
}
