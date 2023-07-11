import React, { useImperativeHandle } from 'react';
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  type OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Fab from '@mui/material/Fab';
import { MdKeyboardArrowUp } from 'react-icons/md';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Search from '@/components/search';
import WindowAction from '@components/window-action';
import './index.less';

interface Props extends OverlayScrollbarsComponentProps {
  titleLeft?: React.ReactNode;
  showScrollBoxShadow?: boolean;
  children: React.ReactNode;
}

export interface ScrollNodeRef {
  getScrollNodeElement: () => HTMLElement | undefined | null;
}

const PageContainer = React.forwardRef<ScrollNodeRef, Props>(({
  titleLeft,
  showScrollBoxShadow = true,
  children,
  ...props
}, ref) => {
  const scrollableNodeRef = React.useRef<OverlayScrollbarsComponentRef>(null);
  const isWindows = window.versions.platform() === 'win32';

  useImperativeHandle(ref, () => ({
    getScrollNodeElement: () => scrollableNodeRef.current?.osInstance()?.elements()?.viewport,
  }), [scrollableNodeRef]);

  const trigger = useScrollTrigger({
    target: scrollableNodeRef.current?.osInstance()?.elements()?.viewport,
    disableHysteresis: true,
    threshold: 140,
  });

  const handleScrollTop = () => {
    scrollableNodeRef.current?.osInstance()?.elements()?.viewport?.scrollTo({ top: 0 });
  };

  return (
    <Box
      sx={{
        flex: '1 0 0',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        id="main-page-header"
        sx={{
          position: 'relative',
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className={trigger && showScrollBoxShadow ? 'sticky-subheader' : ''}
      >
        {titleLeft && (
          <Box
            sx={{
              position: 'absolute',
              left: '12px',
            }}
          >
            {titleLeft}
          </Box>
        )}
        <Search />
        {isWindows && (
          <Box sx={{
            position: 'absolute',
            right: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          >
            <WindowAction />
          </Box>
        )}
      </Box>
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <OverlayScrollbarsComponent
          ref={scrollableNodeRef}
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
          <Fade in={trigger}>
            <Box
              onClick={handleScrollTop}
              role="presentation"
              sx={{ position: 'fixed', bottom: 120, right: 16 }}
            >
              <Fab sx={{ opacity: 0.4 }} size="small" aria-label="scroll back to top">
                <MdKeyboardArrowUp size={24} />
              </Fab>
            </Box>
          </Fade>
        </OverlayScrollbarsComponent>
      </Box>
    </Box>
  );
});

export default PageContainer;
