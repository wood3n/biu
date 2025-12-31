import React, { useEffect } from "react";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";

const ScrollContainer = ({
  ref,
  options,
  children,
  resetOnChange,
  ...props
}: OverlayScrollbarsComponentProps & {
  ref?: React.RefObject<ScrollRefObject | null>;
  /** 当该值发生变化时，重置滚动条到顶部（用于切换路由 id、tab 等场景） */
  resetOnChange?: unknown;
}) => {
  // 统一的滚动重置逻辑
  useEffect(() => {
    if (!ref?.current || !resetOnChange) return;
    const viewport = ref.current.osInstance()?.elements().viewport as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }, [resetOnChange, ref]);

  return (
    <OverlayScrollbarsComponent
      ref={ref}
      options={{
        scrollbars: { autoHide: "leave", autoHideDelay: 2000, theme: "os-theme-light" },
        overflow: { x: "hidden" },
        ...options,
      }}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
export type ScrollRefObject = OverlayScrollbarsComponentRef<"div">;
