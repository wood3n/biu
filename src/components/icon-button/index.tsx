import { Button, Tooltip, type ButtonProps, type TooltipProps } from "@heroui/react";
import { twMerge } from "tailwind-merge";

interface Props extends Omit<ButtonProps, "startContent"> {
  tooltip?: React.ReactNode;
  tooltipProps?: TooltipProps;
}

const IconButton = ({ tooltip, tooltipProps, children, className, variant = "light", ...props }: Props) => {
  // solid 变体保留背景，其余变体 hover 保持 flat 默认变浅 + 文字强调色
  const isSolid = variant === "solid";
  const button = (
    <Button
      isIconOnly
      radius="md"
      size="sm"
      className={twMerge(
        isSolid ? "!px-0 text-inherit hover:opacity-85" : "hover:text-primary !px-0 text-inherit",
        className,
      )}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip closeDelay={0} content={tooltip} {...tooltipProps}>
        {/* 禁用态按钮自带 pointer-events-none，需用 span 包裹让 Tooltip 仍可触发（如"仅日语歌词可开启"提示） */}
        {props.isDisabled ? (
          <span className="inline-flex" tabIndex={-1}>
            {button}
          </span>
        ) : (
          button
        )}
      </Tooltip>
    );
  }

  return button;
};

export default IconButton;
