export const isMiniPlayer = window.location.hash === "#mini-player" || window.location.hash === "#/mini-player";
const playQueueChannel = new BroadcastChannel("play-queue-sync");

export const broadcastState = (payload: any) => {
  if (!isMiniPlayer) {
    playQueueChannel.postMessage({ type: "state-sync", payload });
  }
};

export const sendCommand = (command: string, payload?: any) => {
  if (isMiniPlayer) {
    playQueueChannel.postMessage({ type: "command", command, payload });
  }
};

export const onMessage = (callback: (event: MessageEvent) => void) => {
  playQueueChannel.onmessage = callback;
};

export const requestSync = () => {
  playQueueChannel.postMessage({ type: "request-sync" });
};
