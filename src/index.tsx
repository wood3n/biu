import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./app";
import { tauriAdapter } from "./utils/tauri-adapter";

// Unconditionally inject the Tauri adapter to replace the Electron bridge
console.log("Injecting Tauri adapter...");
(window as any).electron = tauriAdapter;

const root = createRoot(document.getElementById("root") as Element);
root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
