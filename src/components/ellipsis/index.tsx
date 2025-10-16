import React, { useEffect, useRef, useState } from "react";

import { Tooltip, type TooltipProps } from "@heroui/react";
import clx from "classnames";
import { twMerge } from "tailwind-merge";

interface Props {
  lines?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 是否在溢出时显示 Tooltip，默认开启 */
  showTooltip?: boolean;
  /** 传递给 Tooltip 的配置（不包含 content/children） */
  tooltipProps?: Omit<TooltipProps, "content" | "children">;
  tooltipClassName?: string;
}

const lineClampMap = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const Ellipsis = ({
  lines = 1,
  children,
  className,
  style,
  showTooltip = true,
  tooltipProps,
  tooltipClassName,
}: Props) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textElementRef.current) {
      setIsOverflow(textElementRef.current!.scrollHeight > textElementRef.current!.clientHeight);
    }
  }, []);

  const contentNode = (
    <div
      ref={textElementRef}
      className={clx(className, lineClampMap[lines as keyof typeof lineClampMap] || `line-clamp-${lines}`, "relative")}
      style={style}
    >
      {children}
    </div>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip
          closeDelay={0}
          isDisabled={!isOverflowed}
          content={
            <div
              className={twMerge(
                "max-w-[min(80vw,640px)] leading-relaxed break-words whitespace-pre-wrap",
                tooltipClassName,
              )}
            >
              {children}
            </div>
          }
          placement="top-start"
          {...tooltipProps}
        >
          {contentNode}
        </Tooltip>
      ) : (
        contentNode
      )}
    </>
  );
};

export default Ellipsis;
