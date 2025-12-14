import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./app";
import { tauriAdapter } from "./utils/tauri-adapter";

// Detect if running in Tauri
const isTauri = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;

if (isTauri) {
  console.log("Tauri environment detected, injecting adapter...");
  (window as any).electron = tauriAdapter;
}

const root = createRoot(document.getElementById("root") as Element);
root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
