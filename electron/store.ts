import { app } from "electron";
import Store from "electron-store";

import { defaultAppSettings } from "@shared/settings/app-settings";

export const storeKey = {
  appSettings: "appSettings",
} as const;

const settingsSchema = {
  appSettings: {
    type: "object",
  },
} as const;

export const store = new Store<{ appSettings: AppSettings }>({
  name: "app-settings",
  fileExtension: "json",
  schema: settingsSchema,
  defaults: {
    appSettings: {
      ...defaultAppSettings,
      downloadPath: app.getPath("downloads"),
    },
  },
});
