export interface LyricsPreference {
  fontSize: number; // px
  offsetMs: number; // milliseconds, positive delays lyrics
  showTranslation: boolean;
}

export const defaultLyricsPreference: LyricsPreference = {
  fontSize: 20,
  offsetMs: 0,
  showTranslation: true,
};
