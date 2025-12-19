import React from "react";

export const isModifier = (key: string) => ["Control", "Shift", "Alt", "Meta"].includes(key);

export const mapKeyToElectronAccelerator = (e: KeyboardEvent | React.KeyboardEvent): string | null => {
  const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

  // 如果只按下了修饰键，不视为有效组合
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
