import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { twMerge } from "tailwind-merge";

export interface ColorPickerProps {
  /** 颜色选择器预设颜色 */
  presets?: string[];
  /** 受控颜色值（例如：#17c964） */
  value?: string;
  /** 颜色变更回调（返回十六进制颜色） */
  onChange?: (hex: string) => void;
  /** 自定义类名 */
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ presets, value, onChange, className }) => {
  const [hexInput, setHexInput] = useState(value?.replace("#", "") || "");

  useEffect(() => {
    setHexInput(value?.replace("#", "") || "");
  }, [value]);

  return (
    <Popover radius="md" placement="bottom-start" offset={8}>
      <PopoverTrigger>
        <Button style={{ backgroundColor: value }} className={twMerge("border-2 border-[#ffffff]", className)} />
      </PopoverTrigger>
      <PopoverContent className="bg-content2 w-64 p-2">
        <HexColorPicker color={value} onChange={onChange} style={{ width: "100%" }} />
        <div className="mt-2 flex w-full flex-wrap gap-2">
          {presets?.map(preset => (
            <button
              type="button"
              key={preset}
              style={{ backgroundColor: preset }}
              className="rounded-medium h-6 w-6 cursor-pointer"
              onClick={() => {
                onChange?.(preset);
              }}
            />
          ))}
        </div>
        <Input
          size="sm"
          variant="flat"
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
