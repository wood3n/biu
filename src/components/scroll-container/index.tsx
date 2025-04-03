import React from "react";

import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
  OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";

const ScrollContainer = React.forwardRef<OverlayScrollbarsComponentRef<"div">, OverlayScrollbarsComponentProps>(
  ({ options, children, ...props }, ref) => {
    return (
      <OverlayScrollbarsComponent
        ref={ref}
        defer
        options={{ scrollbars: { autoHide: "leave", theme: "os-theme-light" }, ...options }}
        {...props}
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  },
);

export default ScrollContainer;
export type ScrollRefObject = OverlayScrollbarsComponentRef<"div">;
