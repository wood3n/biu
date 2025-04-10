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
}

const StickyHeader = ({ children, observerTarget, observerRoot, className }: Props) => {
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
    // FIXME: backdrop-filter 在这里和 transform 一起使用会有严重的性能问题，无法解决
    <div
      className={clx(
        "sticky -top-16 z-20 -mt-16 h-16 w-full shadow transition-[transform,top] duration-300",
        {
          "translate-y-16": visible,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};

export default StickyHeader;
