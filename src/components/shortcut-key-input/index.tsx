import React, { useState } from "react";

import { Input } from "@heroui/react";
import { RiCloseCircleFill } from "@remixicon/react";

import { mapKeyToElectronAccelerator } from "@/common/utils/shortcut";

interface ShortcutRecorderProps {
  value: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
}

const formatDisplay = (value: string) => {
  if (!value) return "";
  return value.replace("CommandOrControl", "Ctrl").replace("Command", "Cmd").replace("Control", "Ctrl");
};

export const ShortcutKeyInput = ({ value, onChange, isDisabled, isInvalid, errorMessage }: ShortcutRecorderProps) => {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log("e", e);
    e.preventDefault();

    if (e.key === "Backspace" || e.key === "Delete") {
      onChange("");
      return;
    }

    if (e.key === "Escape") {
      (e.currentTarget as HTMLElement).blur();
      return;
    }

    const shortcut = mapKeyToElectronAccelerator(e);
    if (shortcut) {
      onChange(shortcut);
    }
  };

  return (
    <Input
      value={formatDisplay(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      color={focused ? "primary" : isInvalid ? "danger" : "default"}
      endContent={
        !isDisabled && value ? (
          <button type="button" onClick={() => onChange("")} className="text-zinc-500 hover:text-zinc-300">
            <RiCloseCircleFill size={16} />
          </button>
        ) : null
      }
      isDisabled={isDisabled}
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
