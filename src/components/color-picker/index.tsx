import React from "react";
import { HexColorInput, RgbaColor, RgbaColorPicker } from "react-colorful";

import { EyeDropperIcon } from "@heroicons/react/24/outline";
import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@heroui/react";
import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

extend([namesPlugin]);

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
  const [color, setColor] = React.useState(colord(value).toRgb());
  const colorHex = colord(color).toHex();

  React.useEffect(() => {
    setColor(colord(value).toRgb());
  }, [value]);

  const handleEyeDropper = async () => {
    // Check if the native EyeDropper API is supported (Available in Electron 17+)
    if ("EyeDropper" in window) {
      try {
        // @ts-ignore: EyeDropper might not be in your current TS definitions
        const eyeDropper = new window.EyeDropper();
        // @ts-ignore
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          onChange?.(result.sRGBHex);
        }
      } catch (error) {
        // User cancelled the selection (e.g. pressed Esc), no error toast needed
        console.debug("EyeDropper selection cancelled", error);
      }
    } else {
      // Fallback for older environments or if the API is disabled
      try {
        const res = await window.electron.openEyeDropper();
        if (res) onChange?.(res);
      } catch (error) {
        if (error instanceof Error && error.message.includes("cancelled")) {
          // User cancelled the selection, no error toast needed
          console.debug("EyeDropper selection cancelled", error);
        } else {
          toast.error(`Failed to open eye dropper: ${error}`);
        }
      }
    }
  };

  const onColorChange = (newColor: RgbaColor) => {
    setColor(newColor);
    onChange?.(colord(newColor).toHex());
  };
  return (
    <Popover radius="md" placement="bottom-start" offset={8}>
      <PopoverTrigger>
        <Button style={{ backgroundColor: value }} className={twMerge("border-2 border-[#ffffff]", className)} />
      </PopoverTrigger>
      <PopoverContent className="bg-content2 p-2">
        <RgbaColorPicker color={color} onChange={onColorChange} />
        <div className="mt-2 flex items-center gap-2">
          <Tooltip content="Eye Dropper" placement="top">
            <Button isIconOnly size="sm" onClick={handleEyeDropper}>
              <EyeDropperIcon className="size-4" />
            </Button>
          </Tooltip>
          <HexColorInput
            className="border-default-200 text-foreground w-full rounded-md border bg-transparent px-2 py-1 text-sm"
            prefixed
            alpha
            color={colorHex}
            onChange={onChange}
          />
        </div>
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
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
