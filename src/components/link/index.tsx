import React, { useEffect, useRef, useState } from "react";

import clx from "classnames";
import { Link as HeroLink, type LinkProps, Tooltip } from "@heroui/react";

const Link = ({ children, className, ...props }: LinkProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isOverflowed, setIsOverflow] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setIsOverflow(ref.current.scrollWidth > ref.current.clientWidth);
    }
  });

  return (
    <Tooltip isDisabled={!isOverflowed} content={children}>
      <HeroLink {...props} className={clx(className, "inline-block truncate")} ref={ref}>
        {children}
      </HeroLink>
    </Tooltip>
  );
};

export default Link;
