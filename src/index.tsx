import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { App } from "./app";

const root = createRoot(document.getElementById("root") as Element);
root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
