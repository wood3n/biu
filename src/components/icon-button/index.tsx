import { Button, Tooltip, type ButtonProps, type TooltipProps } from "@heroui/react";
import { twMerge } from "tailwind-merge";

interface Props extends ButtonProps {
  tooltip?: React.ReactNode;
  tooltipProps?: TooltipProps;
}

const IconButton = ({ tooltip, tooltipProps, children, className, ...props }: Props) => {
  const button = (
    <Button
      isIconOnly
      radius="md"
      size="sm"
      variant="light"
      className={twMerge("hover:text-primary text-inherit", className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip closeDelay={0} content={tooltip} {...tooltipProps}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default IconButton;
