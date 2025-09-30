import React from "react";
import { SketchPicker, type ColorResult } from "react-color";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { twMerge } from "tailwind-merge";

export interface ColorPickerProps {
  /** 受控颜色值（例如：#17c964） */
  value?: string;
  /** 颜色变更回调（返回十六进制颜色） */
  onChange?: (hex: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * ColorPicker 颜色选择组件
 * - 无文本按钮，仅展示当前颜色
 * - 点击按钮弹出 Popover，内嵌 react-color 的 SketchPicker
 * - 选择颜色后更新按钮显示，并通过 onChange 通知父组件
 * - 样式与 HeroUI 设计风格一致（使用 HeroUI 的 Button/Popover）
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ value = "#1ed760", onChange, className }) => {
  const handleChange = (c: ColorResult) => {
    const hex = c.hex;
    onChange?.(hex);
  };

  return (
    <Popover placement="bottom-start" offset={8}>
      <PopoverTrigger>
        <Button style={{ backgroundColor: value }} className={twMerge("border-2 border-[#ffffff]", className)} />
      </PopoverTrigger>
      <PopoverContent className="bg-content2 p-2">
        <SketchPicker color={value} onChange={handleChange} disableAlpha />
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
