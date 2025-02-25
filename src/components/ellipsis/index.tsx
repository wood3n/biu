import React, { useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { Tooltip } from "@heroui/react";

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Ellipsis = ({ children, className, style }: Props) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOverflow(textElementRef.current!.scrollWidth > textElementRef.current!.clientWidth);
  }, []);

  return (
    <Tooltip color="foreground" isOpen={isOverflowed} closeDelay={0} content={children}>
      <div ref={textElementRef} className={classNames(className, "truncate")} style={style}>
        {children}
      </div>
    </Tooltip>
  );
};

export default Ellipsis;
