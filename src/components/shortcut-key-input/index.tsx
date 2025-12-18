import React, { useEffect, useState } from "react";

import { Input } from "@heroui/react";
import { RiCloseCircleFill } from "@remixicon/react";

import { mapKeyToElectron } from "@/common/utils/shortcut";
import { useShortcutSettings } from "@/store/shortcuts";

interface ShortcutRecorderProps {
  value: string;
  onChange: (value: string) => void;
  shortcutId?: string;
  shortcutType?: "shortcut" | "globalShortcut";
}

const formatDisplay = (value: string) => {
  if (!value) return "";
  return value.replace("CommandOrControl", "Ctrl").replace("Command", "Cmd").replace("Control", "Ctrl");
};

export const ShortcutKeyInput = ({ value, onChange, shortcutId, shortcutType }: ShortcutRecorderProps) => {
  const [focused, setFocused] = useState(false);
  const [systemConflict, setSystemConflict] = useState(false);
  const { shortcuts } = useShortcutSettings.getState();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.key === "Backspace" || e.key === "Delete") {
      onChange("");
      return;
    }

    if (e.key === "Escape") {
      (e.currentTarget as HTMLElement).blur();
      return;
    }

    const shortcut = mapKeyToElectron(e);
    if (shortcut) {
      onChange(shortcut);
    }
  };

  // 检测系统全局快捷键冲突
  useEffect(() => {
    let active = true;
    if (shortcutType === "globalShortcut" && value) {
      window.electron.checkShortcut(value).then(isAvailable => {
        if (active) {
          setSystemConflict(!isAvailable);
        }
      });
    } else {
      setSystemConflict(false);
    }
    return () => {
      active = false;
    };
  }, [value, shortcutType]);

  // 检测应用内快捷键冲突
  const internalConflict =
    value && shortcutId && shortcutType ? shortcuts.find(s => s.id !== shortcutId && s[shortcutType] === value) : null;

  const isInvalid = !!internalConflict || systemConflict;
  const errorMessage = internalConflict
    ? `与 "${internalConflict.name}" 冲突`
    : systemConflict
      ? "快捷键被系统或其他应用占用"
      : undefined;

  return (
    <Input
      value={formatDisplay(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      color={focused ? "primary" : isInvalid ? "danger" : "default"}
      endContent={
        value && !focused ? (
          <button type="button" onClick={() => onChange("")} className="text-zinc-500 hover:text-zinc-300">
            <RiCloseCircleFill size={16} />
          </button>
        ) : null
      }
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      classNames={{
        innerWrapper: "cursor-pointer select-none",
        input: "cursor-pointer select-none",
      }}
      readOnly
    />
  );
};

export default ShortcutKeyInput;
