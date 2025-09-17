import React from "react";

import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
  OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";

const ScrollContainer = ({
  ref,
  options,
  children,
  ...props
}: OverlayScrollbarsComponentProps & { ref?: React.RefObject<OverlayScrollbarsComponentRef<"div"> | null> }) => {
  return (
    <OverlayScrollbarsComponent
      ref={ref}
      options={{ scrollbars: { autoHide: "leave", theme: "os-theme-light" }, ...options }}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
export type ScrollRefObject = OverlayScrollbarsComponentRef<"div">;
