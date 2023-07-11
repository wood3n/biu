import React from 'react';
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  type OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';

const ScrollBarContainer = React.forwardRef<OverlayScrollbarsComponentRef, OverlayScrollbarsComponentProps>(({
  children,
  ...props
}, ref) => (
  <OverlayScrollbarsComponent
    ref={ref}
    options={{
      overflow: {
        x: 'hidden',
      },
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'move',
        autoHideDelay: 800,
      },
    }}
    style={{ height: '100%' }}
    {...props}
  >
    {children}
  </OverlayScrollbarsComponent>
));

export default ScrollBarContainer;
export type {
  OverlayScrollbarsComponentProps,
  OverlayScrollbarsComponentRef,
};
