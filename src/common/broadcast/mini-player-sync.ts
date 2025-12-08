export function createBroadcastChannel() {
  return new BroadcastChannel("play-list-store-sync-channel");
}
