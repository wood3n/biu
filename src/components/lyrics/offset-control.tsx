import { useCallback, useRef, useState } from "react";

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
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const step = 50;

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -step : step;
      const next = Math.min(max, Math.max(min, value + delta));
      if (next !== value) {
        onChange(next);
      }
    },
    [max, min, onChange, step, value],
  );

  const setSliderRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener("wheel", onWheel);
      }
      sliderRef.current = node;
      if (node) {
        node.addEventListener("wheel", onWheel, { passive: false });
      }
    },
    [onWheel],
  );

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
          className="min-w-0 rounded-full bg-white/20 text-xs font-semibold text-white hover:bg-white/30"
        >
          <RiTimeLine size={16} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="px-3 py-2">
        <div ref={setSliderRef} className="flex flex-col items-center gap-2">
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
