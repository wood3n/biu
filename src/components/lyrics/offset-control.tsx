import { useCallback, useState, useEffect } from "react";

import { Input, Popover, PopoverContent, PopoverTrigger, Slider, Switch } from "@heroui/react";
import { RiTimeLine } from "@remixicon/react";

import IconButton from "../icon-button";

interface OffsetControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  onOpenChange?: (open: boolean) => void;
}

const formatLabel = (ms: number) => (ms >= 0 ? `+${ms}` : `${ms}`);

const OffsetControl = ({ value, min = -7000, max = 7000, onChange, onOpenChange }: OffsetControlProps) => {
  const [open, setOpen] = useState(false);
  const [customOffset, setCustomOffset] = useState(value);
  const [useCustom, setUseCustom] = useState(false);
  const step = 50;

  useEffect(() => {
    setCustomOffset(value);
  }, [value]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const val = typeof e === 'string' ? e : e.target.value;
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal)) {
      setCustomOffset(numVal);
      onChange(numVal);
    }
  };

  const handleSliderChange = (v: number | number[]) => {
    const val = Array.isArray(v) ? v[0] : v;
    setCustomOffset(val);
    onChange(val);
  };

  return (
    <Popover
      placement="right"
      showArrow={false}
      shouldCloseOnBlur={false}
      disableAnimation
      offset={8}
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <IconButton
          size="sm"
          variant="light"
          aria-label="调整歌词偏移"
          className="bg-foreground/20 text-foreground hover:bg-foreground/30 min-w-0 rounded-full text-xs font-semibold"
        >
          <RiTimeLine size={16} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="px-3 py-2">
        <div className="flex flex-col items-center gap-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs">自定义</span>
            <Switch isSelected={useCustom} onValueChange={setUseCustom} />
          </div>

          {useCustom ? (
            <div className="flex flex-col items-center gap-2">
              <Input
                type="number"
                value={customOffset.toString()}
                onChange={(e) => handleCustomChange(e)}
                className="w-24 text-center"
                size="sm"
                endContent={<span className="text-xs">ms</span>}
              />
              <span className="text-foreground/60 whitespace-nowrap text-[10px] font-bold">
                {formatLabel(customOffset)} ms
              </span>
            </div>
          ) : (
            <>
              <Slider
                aria-label="调整歌词偏移"
                minValue={min}
                maxValue={max}
                step={step}
                value={value}
                onChange={handleSliderChange}
                size="sm"
                color="primary"
                orientation="vertical"
                className="h-32"
                classNames={{
                  track: "w-1",
                  thumb: "after:hidden",
                }}
              />
              <span className="text-foreground/60 text-[10px] font-bold whitespace-nowrap">{formatLabel(value)} ms</span>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OffsetControl;
