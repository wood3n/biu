import React, { useState } from "react";

import { useInViewport } from "ahooks";
import { BasicTarget } from "ahooks/lib/utils/domTarget";
import clx from "classnames";

interface Props {
  children: React.ReactNode;
  observerTarget?: BasicTarget;
  observerRoot?: BasicTarget;
  gradientColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const StickyHeader = ({ children, observerTarget, observerRoot, gradientColor, className, style }: Props) => {
  const [visible, setVisible] = useState(false);

  useInViewport(observerTarget, {
    root: observerRoot,
    threshold: [1, 0],
    callback: entry => {
      if (entry.intersectionRatio <= 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    },
  });

  return (
    <div
      className={clx(
        "sticky -top-16 z-20 -mt-16 flex h-16 w-full items-center justify-between bg-second-background/90 px-6 shadow-md backdrop-blur transition-[transform,top] duration-300",
        {
          "translate-y-16": visible,
        },
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to right, ${gradientColor}, #18181b)`,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default StickyHeader;
