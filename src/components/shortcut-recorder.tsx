import React, { useState, useRef } from "react";

import { Input, Kbd } from "@heroui/react";
import { RiCloseCircleFill } from "@remixicon/react";

interface ShortcutRecorderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const isModifier = (key: string) => ["Control", "Shift", "Alt", "Meta"].includes(key);

const mapKeyToElectron = (e: React.KeyboardEvent): string | null => {
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
  // 可以根据需要添加更多按键映射

  if (modifiers.length === 0 && k.length === 1) {
      // 单字符通常不作为快捷键，除非是F1-F12等功能键
      // 这里简单处理，允许单键
  }

  return [...modifiers, k].join("+");
};

const formatDisplay = (value: string) => {
  if (!value) return "";
  return value
    .replace("CommandOrControl", "Ctrl")
    .replace("Command", "Cmd")
    .replace("Control", "Ctrl");
};

export const ShortcutRecorder = ({ value, onChange, placeholder, disabled }: ShortcutRecorderProps) => {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (e.key === "Backspace" || e.key === "Delete") {
      onChange("");
      return;
    }
    
    if (e.key === "Escape") {
        e.currentTarget.blur();
        return;
    }

    const shortcut = mapKeyToElectron(e);
    if (shortcut) {
      onChange(shortcut);
    }
  };

  return (
    <div className="relative flex w-full items-center">
      <Input
        value={focused ? "按下键盘设置快捷键..." : formatDisplay(value)}
        placeholder={placeholder || "未设置"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        isDisabled={disabled}
        endContent={
          value && !disabled && !focused ? (
             <button onClick={() => onChange("")} className="text-zinc-500 hover:text-zinc-300">
                <RiCloseCircleFill size={16} />
             </button>
          ) : null
        }
        classNames={{
             input: "cursor-default select-none",
        }}
        readOnly // Prevent typing text
      />
    </div>
  );
};

export default ShortcutRecorder;
