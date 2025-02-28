import React from "react";

import { OverlayScrollbarsComponent, OverlayScrollbarsComponentProps } from "overlayscrollbars-react";

import "overlayscrollbars/overlayscrollbars.css";

// @ts-ignore options type not match
const ScrollContainer = ({ options, children, ...props }: OverlayScrollbarsComponentProps["options"] & { children: React.ReactNode }) => {
  return (
    <OverlayScrollbarsComponent defer options={{ scrollbars: { theme: "os-theme-light" }, ...options }} {...props}>
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
