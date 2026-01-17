import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Input, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

export interface ColorPickerProps {
  /** 颜色选择器预设颜色 */
  presets?: string[];
  /** 受控颜色值（例如：#17c964） */
  value?: string;
  /** 颜色变更回调（返回十六进制颜色） */
  onChange?: (hex: string) => void;
  /** 自定义类名 */
  children?: React.ReactNode;
  /** 受控打开状态（不传则不受控） */
  isOpen?: boolean;
  /** 打开状态变更回调（不传则使用不受控） */
  onOpenChange?: (open: boolean) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ presets, value, onChange, children, isOpen, onOpenChange }) => {
  const [hexInput, setHexInput] = useState(value?.replace("#", "") || "");

  useEffect(() => {
    setHexInput(value?.replace("#", "") || "");
  }, [value]);

  const debounceTimer = useRef<number | null>(null);
  const handleChange = (hex: string) => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      onChange?.(hex);
    }, 200);
  };

  return (
    <Popover radius="md" placement="bottom-start" offset={8} isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="bg-content2 w-64 p-2">
        <HexColorPicker color={value} onChange={handleChange} style={{ width: "100%" }} />
        {Boolean(presets) && (
          <div className="mt-2 flex w-full flex-wrap gap-2">
            {presets?.map(preset => (
              <button
                type="button"
                key={preset}
                style={{ backgroundColor: preset }}
                className="rounded-medium border-default h-6 w-6 cursor-pointer border"
                onClick={() => {
                  onChange?.(preset);
                }}
              />
            ))}
          </div>
        )}
        <Input
          size="sm"
          variant="bordered"
          value={hexInput}
          onValueChange={v => {
            setHexInput(v);
            const hex = `#${v}`;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
              onChange?.(hex);
            }
          }}
          startContent={<span className="text-small text-default-400">#</span>}
          className="mt-2"
        />
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
