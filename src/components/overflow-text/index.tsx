import React, { useRef, useState, useEffect } from 'react';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { type TooltipProps } from '@mui/material/Tooltip';
import { type TypographyTypeMap } from '@mui/material/Typography';

interface PropsWithChildren extends Omit<TooltipProps, 'children' | 'color'> {
  children?: React.ReactNode;
}

type Props = PropsWithChildren & TypographyTypeMap['props'];

const StyleTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 140,
    'white-space': 'pre-wrap',
    'overflow-wrap': 'anywhere',
  },
}));

const OverflowText = ({
  title,
  arrow,
  PopperProps,
  placement,
  children,
  className,
  style,
  paragraph,
  onClick,
  variant,
  color,
}: Props) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

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
        ...PopperProps,
      }}
    >
      <Typography
        ref={textElementRef}
        onClick={onClick}
        noWrap
        variant={variant}
        paragraph={paragraph}
        color={color}
        className={className}
        style={style}
      >
        {children}
      </Typography>
    </StyleTooltip>
  );
};

export default OverflowText;
