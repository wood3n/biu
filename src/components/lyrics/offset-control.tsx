import { useCallback, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger, Slider } from "@heroui/react";
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

const OffsetControl = ({ value, min = -5000, max = 5000, onChange, onOpenChange }: OffsetControlProps) => {
  const [open, setOpen] = useState(false);
  const step = 50;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

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
          <Slider
            aria-label="调整歌词偏移"
            minValue={min}
            maxValue={max}
            step={step}
            value={value}
            onChange={v => onChange(v as number)}
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OffsetControl;
