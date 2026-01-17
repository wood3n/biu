import { useCallback, useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger, Slider } from "@heroui/react";
import { RiFontSize } from "@remixicon/react";

import IconButton from "../icon-button";

interface FontSizeControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  onOpenChange?: (open: boolean) => void;
}

const FontSizeControl = ({ value, min = 12, max = 48, onChange, onOpenChange }: FontSizeControlProps) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const step = 1;

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

  const setSliderRef = useCallback((node: HTMLDivElement | null) => {
    sliderRef.current = node;
  }, []);

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onWheel, sliderRef.current]);

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
          aria-label="调整字体大小"
          className="bg-foreground/20 text-foreground hover:bg-foreground/30 min-w-0 rounded-full text-sm font-semibold"
        >
          <RiFontSize size={16} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="px-3 py-2">
        <div ref={setSliderRef} className="flex flex-col items-center gap-2">
          <Slider
            aria-label="调整字体大小"
            minValue={min}
            maxValue={max}
            step={step}
            value={value}
            onChange={v => onChange(v as number)}
            size="sm"
            color="primary"
            orientation="vertical"
            className="h-28"
            classNames={{
              track: "w-1",
              thumb: "after:hidden",
            }}
          />
          <span className="text-foreground/60 text-[10px] font-bold whitespace-nowrap">{Math.round(value)}px</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FontSizeControl;
