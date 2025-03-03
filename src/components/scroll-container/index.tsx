import React from "react";

import { OverlayScrollbarsComponent, OverlayScrollbarsComponentProps } from "overlayscrollbars-react";

const ScrollContainer = ({ options, children, ...props }: OverlayScrollbarsComponentProps & { children: React.ReactNode }) => {
  return (
    <OverlayScrollbarsComponent defer options={{ scrollbars: { autoHide: "leave", theme: "os-theme-light" }, ...options }} {...props}>
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
