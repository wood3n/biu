import { readableColor } from "color2k";
import Values from "values.js";

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string) {
  // Convert hex to RGB first
  const [r, g, b] = hexToRgb(hex);

  // Normalize RGB values
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  // Find the maximum and minimum values of R, G, B
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);

  // Calculate the lightness
  const lightness = (max + min) / 2;

  // If the maximum and minimum are equal, there is no saturation
  if (max === min) {
    return `${0} ${0}% ${lightness * 100}%`;
  }

  // Calculate the saturation
  let saturation = 0;

  if (lightness < 0.5) {
    saturation = (max - min) / (max + min);
  } else {
    saturation = (max - min) / (2 - max - min);
  }

  // Calculate the hue
  let hue;

  if (max === normalizedR) {
    hue = (normalizedG - normalizedB) / (max - min);
  } else if (max === normalizedG) {
    hue = 2 + (normalizedB - normalizedR) / (max - min);
  } else {
    hue = 4 + (normalizedR - normalizedG) / (max - min);
  }

  hue *= 60;
  if (hue < 0) hue += 360;

  return `${hue.toFixed(2)} ${(saturation * 100).toFixed(2)}% ${(lightness * 100).toFixed(2)}%`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): number[] {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;

  if (hex.length === 4 || hex.length === 5) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7 || hex.length === 9) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    throw new Error("Invalid hex color format");
  }

  return [r, g, b];
}

export type ColorPickerType = "background" | "content1" | "default" | "foreground" | "primary";

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ThemeColor extends ColorShades {
  foreground: string;
  DEFAULT: string;
}

export const defaultDarkColorWeight = 20;
export const defaultLightColorWeight = 17.5;
export const colorWeight = 17.5;
export function getColorWeight(colorType: ColorPickerType, theme: "light" | "dark") {
  if (colorType === "default") {
    return theme === "dark" ? defaultDarkColorWeight : defaultLightColorWeight;
  }

  return colorWeight;
}

function rgbValueToHex(c: number) {
  const hex = c.toString(16);

  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex([r, g, b]: number[]): string {
  return "#" + rgbValueToHex(r) + rgbValueToHex(g) + rgbValueToHex(b);
}

export function swapColorValues<T extends object>(colors: T) {
  const swappedColors = {};
  const keys = Object.keys(colors);
  const length = keys.length;

  for (let i = 0; i < length / 2; i++) {
    const key1 = keys[i];
    const key2 = keys[length - 1 - i];

    // @ts-ignore
    swappedColors[key1] = colors[key2];
    // @ts-ignore
    swappedColors[key2] = colors[key1];
  }
  if (length % 2 !== 0) {
    const middleKey = keys[Math.floor(length / 2)];

    // @ts-ignore
    swappedColors[middleKey] = colors[middleKey];
  }

  return swappedColors;
}

export function generateThemeColor(color: string, type: ColorPickerType, theme: "light" | "dark"): ThemeColor {
  const values = new Values(color);
  const colorWeight = getColorWeight(type, theme);
  const colorValues = values.all(colorWeight);
  const shades = colorValues.slice(0, colorValues.length - 1).reduce((acc, shadeValue, index) => {
    (acc as any)[index === 0 ? 50 : index * 100] = rgbToHex(shadeValue.rgb);

    return acc;
  }, {} as ColorShades);

  return {
    ...((theme === "light" ? shades : swapColorValues(shades)) as ColorShades),
    foreground: readableColor(shades[500] as string),
    DEFAULT: shades[500],
  };
}

export function setCssColor(colorType: ColorPickerType, value: string, theme: "light" | "dark") {
  const rootEl = document.documentElement;

  const themeColor = generateThemeColor(value, colorType, theme);

  const rootStyle = rootEl.style;

  Object.keys(themeColor).forEach(key => {
    const value = hexToHsl(themeColor[key as keyof ThemeColor]);

    if (key === "DEFAULT") {
      rootStyle.setProperty(`--heroui-${colorType}`, value);
    } else {
      rootStyle.setProperty(`--heroui-${colorType}-${key}`, value);
    }
  });
}

export function resolveTheme(theme: ThemeMode, systemTheme?: "light" | "dark") {
  if (theme === "system") {
    if (systemTheme) {
      return systemTheme;
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }
  return theme;
}
