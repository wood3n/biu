import { createContext, use } from "react";

export const ThemeNameContext = createContext<{ theme: "light" | "dark" }>({ theme: "light" });

export const useTheme = () => use(ThemeNameContext);
