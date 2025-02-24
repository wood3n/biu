import React from "react";

import { useBoolean } from "ahooks";
import classNames from "classnames";
import { Spinner } from "@heroui/react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { TooltipProps } from "@mui/material/Tooltip/Tooltip";

import { isThenable } from "@/common/utils";

import styles from "./index.module.less";

interface Props extends Omit<TooltipProps, "onClick"> {
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | ((e: React.MouseEvent<HTMLElement>) => Promise<any>);
  className?: string;
  tooltipStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

/**
 * 带有tooltip提示的按钮
 */
function TooltipButton({ disabled, onClick, size, className, style, children, tooltipStyle, ...props }: React.PropsWithChildren<Props>) {
  const [loading, { setTrue, setFalse }] = useBoolean(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = e => {
    e.stopPropagation();
    const returnOnClick = onClick?.(e);
    if (!isThenable(returnOnClick)) return;

    setTrue();
    (returnOnClick as Promise<any>).finally(() => {
      setFalse();
    });
  };

  const btnNode = (
    <IconButton disabled={disabled} size={size} onClick={handleClick} className={classNames(className, styles.button)} style={style}>
      {children}
    </IconButton>
  );

  if (disabled) {
    return btnNode;
  }

  if (loading) {
    return <Spinner classNames={{ label: "text-foreground mt-4" }} label="simple" variant="simple" />;
  }

  return (
    <Tooltip
      placement="top"
      PopperProps={{
        disablePortal: true,
        style: { pointerEvents: "none" },
      }}
      {...props}
      style={tooltipStyle}
    >
      {btnNode}
    </Tooltip>
  );
}

export default TooltipButton;
