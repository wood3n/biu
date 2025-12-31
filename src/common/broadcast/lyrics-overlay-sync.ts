const LYRICS_OVERLAY_CHANNEL = "lyrics-overlay-sync-channel";

export function createLyricsBroadcastChannel() {
  return new BroadcastChannel(LYRICS_OVERLAY_CHANNEL);
}
