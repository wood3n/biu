import React from "react";

const isModifier = (key: string) => ["Control", "Shift", "Alt", "Meta"].includes(key);

export const mapKeyToElectronAccelerator = (e: KeyboardEvent | React.KeyboardEvent): string | null => {
  const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

  if (isModifier(key)) return null;

  const modifiers: string[] = [];
  if (ctrlKey || metaKey) modifiers.push("CommandOrControl");
  if (altKey) modifiers.push("Alt");
  if (shiftKey) modifiers.push("Shift");

  let k = key.toUpperCase();
  if (key === " ") k = "Space";
  if (key === "ArrowUp") k = "Up";
  if (key === "ArrowDown") k = "Down";
  if (key === "ArrowLeft") k = "Left";
  if (key === "ArrowRight") k = "Right";

  return [...modifiers, k].join("+");
};

export type ShortcutDisplayPlatform = "macos" | "windows" | "linux";

const getShortcutDisplayPlatform = (): ShortcutDisplayPlatform => {
  const w: any = globalThis as any;

  try {
    const p = w?.window?.electron?.getPlatform?.();
    if (p === "macos" || p === "windows" || p === "linux") return p;
  } catch (error) {
    void error;
  }

  try {
    const nav: any = w?.navigator;
    const platform = String(nav?.platform || "");
    if (/mac/i.test(platform)) return "macos";
    if (/win/i.test(platform)) return "windows";
  } catch (error) {
    void error;
  }

  return "windows";
};

export const formatElectronAcceleratorForDisplay = (
  accelerator: string,
  platform: ShortcutDisplayPlatform = getShortcutDisplayPlatform(),
): string => {
  if (!accelerator) return "";

  const parts = accelerator.split("+").filter(Boolean);
  return parts
    .map(p => {
      switch (p) {
        case "CommandOrControl":
          return platform === "macos" ? "⌘" : "Ctrl";
        case "Command":
          return "⌘";
        case "Control":
          return "Ctrl";
        case "Alt":
          return platform === "macos" ? "⌥" : "Alt";
        case "Shift":
          return platform === "macos" ? "⇧" : "Shift";
        case "Up":
          return "↑";
        case "Down":
          return "↓";
        case "Left":
          return "←";
        case "Right":
          return "→";
        case "Space":
          return platform === "macos" ? "␣" : "Space";
        default:
          return p;
      }
    })
    .join("+");
};
