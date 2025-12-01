export const isMiniPlayer = window.location.hash === "#mini-player" || window.location.hash === "#/mini-player";
const miniPlayerChannel = new BroadcastChannel("mini-player-sync");

export const broadcastState = (payload: any) => {
  if (!isMiniPlayer) {
    miniPlayerChannel.postMessage({ type: "state-sync", payload });
  }
};

export const sendCommand = (command: string, payload?: any) => {
  if (isMiniPlayer) {
    miniPlayerChannel.postMessage({ type: "command", command, payload });
  }
};

export const onMessage = (callback: (event: MessageEvent) => void) => {
  miniPlayerChannel.onmessage = callback;
};

export const requestSync = () => {
  miniPlayerChannel.postMessage({ type: "request-sync" });
};
