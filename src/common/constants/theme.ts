import type { ConfigThemes } from "@heroui/react";

export const Themes: ConfigThemes = {
  dark: {
    extend: "dark",
    colors: {
      background: "#14151a",
      primary: {
        DEFAULT: "#7fc79a",
        foreground: "#ffffff",
      },
    },
  },
  light: {
    extend: "light",
    colors: {
      background: "#f6f7f5",
      primary: {
        DEFAULT: "#5a9e7c",
        foreground: "#ffffff",
      },
    },
  },
};
