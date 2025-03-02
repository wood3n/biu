import React from "react";

import { OverlayScrollbarsComponent, OverlayScrollbarsComponentProps } from "overlayscrollbars-react";

import "overlayscrollbars/overlayscrollbars.css";

const ScrollContainer = ({ options, children, ...props }: OverlayScrollbarsComponentProps & { children: React.ReactNode }) => {
  return (
    <OverlayScrollbarsComponent defer options={{ scrollbars: { theme: "os-theme-light" }, ...options }} {...props}>
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
