import React, { useEffect, useRef, useState } from "react";

import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import type { TooltipProps } from "@mui/material/Tooltip";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import type { TypographyTypeMap } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";

interface PropsWithChildren extends Omit<TooltipProps, "children" | "color"> {
  link?: boolean;
  children?: React.ReactNode;
  onClick?: (React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLSpanElement>) | undefined;
}

type Props = PropsWithChildren & TypographyTypeMap["props"];

const StyleTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
}));

const HoverLink = styled(Link)(({ theme }) => ({
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

function OverflowText({
  maxWidth = 140,
  link,
  title,
  arrow,
  PopperProps,
  placement,
  children,
  className,
  style,
  sx,
  paragraph,
  onClick,
  variant,
  color,
}: Props) {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement | HTMLAnchorElement>(null);

  useEffect(() => {
    setIsOverflow(textElementRef.current!.scrollWidth > textElementRef.current!.clientWidth);
  }, []);

  return (
    <StyleTooltip
      disableHoverListener={!isOverflowed}
      title={title}
      arrow={arrow}
      placement={placement}
      PopperProps={{
        disablePortal: true,
        style: { pointerEvents: "none" },
        ...PopperProps,
      }}
      sx={{
        maxWidth,
      }}
    >
      {link ? (
        <HoverLink
          // @ts-expect-error
          component="div"
          underline="none"
          variant={variant}
          color={color}
          onClick={onClick}
          ref={textElementRef as React.MutableRefObject<HTMLAnchorElement>}
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...sx,
          }}
          className={className}
          style={style}
        >
          {children}
        </HoverLink>
      ) : (
        <Typography
          ref={textElementRef}
          onClick={onClick}
          noWrap
          variant={variant}
          paragraph={paragraph}
          color={color}
          sx={sx}
          className={className}
          style={style}
        >
          {children}
        </Typography>
      )}
    </StyleTooltip>
  );
}

export default OverflowText;
