import React, { useImperativeHandle } from 'react';
import SimpleBar from 'simplebar-react';
import { type Props as SimpleBarProps } from 'simplebar-react/dist';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Fab from '@mui/material/Fab';
import { MdKeyboardArrowUp } from 'react-icons/md';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Search from '@/components/search';
import WindowAction from '@components/window-action';
import './index.less';

interface Props extends SimpleBarProps {
  titleLeft?: React.ReactNode;
  showScrollBoxShadow?: boolean;
  children: React.ReactNode;
}

export interface ScrollNodeRef {
  getScrollNodeRef: () => React.MutableRefObject<HTMLDivElement | undefined>;
}

const PageContainer = React.forwardRef<ScrollNodeRef, Props>(({
  titleLeft,
  showScrollBoxShadow = true,
  children,
  ...props
}, ref) => {
  const scrollableNodeRef = React.useRef<HTMLDivElement>();
  const isWindows = window.versions.platform() === 'win32';

  useImperativeHandle(ref, () => ({
    getScrollNodeRef: () => scrollableNodeRef,
  }), [scrollableNodeRef]);

  const trigger = useScrollTrigger({
    target: scrollableNodeRef.current,
    disableHysteresis: true,
    threshold: 140,
  });

  const handleScrollTop = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#main-page-scroll-observe-node');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
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
        <SimpleBar scrollableNodeProps={{ ref: scrollableNodeRef }} {...props} style={{ height: '100%' }}>
          <span id="main-page-scroll-observe-node" />
          {children}
          <Fade in={trigger}>
            <Box
              onClick={handleScrollTop}
              role="presentation"
              sx={{ position: 'fixed', bottom: 120, right: 16 }}
            >
              <Fab sx={{ opacity: 0.5 }} size="small" aria-label="scroll back to top">
                <MdKeyboardArrowUp size={24} />
              </Fab>
            </Box>
          </Fade>
        </SimpleBar>
      </Box>
    </Box>
  );
});

export default PageContainer;
