import React, { useEffect, useRef } from "react";

import { useOverlayScrollbars } from "overlayscrollbars-react";

interface Props {
  getPageData: (page: number) => Promise<boolean | undefined>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const InfiniteScroll = ({ getPageData, children, className, style }: Props) => {
  const rootRef = useRef(null);
  const outerRef = useRef(null);
  const [initialize] = useOverlayScrollbars({ defer: true });

  useEffect(() => {
    const { current: root } = rootRef;
    const { current: outer } = outerRef;

    if (root && outer) {
      initialize({
        target: root,
        elements: {
          viewport: outer,
        },
      });
    }
  }, [initialize]);

  return (
    <div data-overlayscrollbars-initialize="" ref={rootRef} className={className} style={style}>
      InfiniteScroll
    </div>
  );
};

export default InfiniteScroll;
