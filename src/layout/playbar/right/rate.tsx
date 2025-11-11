import React from "react";

import { Button, Tooltip } from "@heroui/react";

import { PlayRate } from "../constants";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const Rate = ({ value, onChange }: Props) => {
  const tooltipId = "rate-tooltip";

  return (
    <Tooltip
      id={tooltipId}
      placement="top"
      delay={200}
      showArrow={false}
      classNames={{
        content: "py-3 px-2 w-[60px] min-w-[60px] flex flex-col items-center gap-1",
      }}
      content={
        <div className="flex flex-col items-center gap-1">
          {PlayRate.map(v => (
            <Button
              key={v}
              isIconOnly
              size="sm"
              color={v === value ? "primary" : "default"}
              variant={v === value ? "solid" : "light"}
              className="min-w-[40px]"
              aria-label={`${v}倍速`}
              onPress={() => onChange(v)}
            >
              {v}x
            </Button>
          ))}
        </div>
      }
    >
      <Button
        isIconOnly
        variant="light"
        size="sm"
        className="text-medium hover:text-primary min-w-fit px-2"
        aria-label="播放速率"
        aria-describedby={tooltipId}
      >
        {value}x
      </Button>
    </Tooltip>
  );
};

export default Rate;
