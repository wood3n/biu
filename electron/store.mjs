import { app } from "electron";
import Store from "electron-store";

export const store = new Store({
  schema: {
    appSettings: {
      type: "object",
      properties: {
        downloadPath: { type: "string", default: app.getPath("downloads") },
        autoStart: { type: "boolean", default: false },
        closeWindowOption: { enum: ["hide", "close"], default: "hide" },
      },
    },
  },
  defaults: {
    appSettings: {
      downloadPath: app.getPath("downloads"),
      autoStart: false,
      closeWindowOption: "hide",
    },
  },
});

export const storeKey = {
  appSettings: "appSettings",
};
