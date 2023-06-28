import React from 'react';
import SimpleBar from 'simplebar-react';
import { type Props as SimpleBarProps } from 'simplebar-react/dist';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Fab from '@mui/material/Fab';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { MdKeyboardArrowUp } from 'react-icons/md';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Search from '@components/search';
import WindowAction from '@components/window-action';
import './index.less';

interface SpeedAction {
  icon: React.ReactNode;
  name: string;
  onClick: VoidFunction;
}

interface Props extends SimpleBarProps {
  left?: React.ReactNode;
  showScrollBoxShadow?: boolean;
  children: React.ReactNode;
  speedActions?: SpeedAction[];
}

const PageContainer = ({
  left,
  showScrollBoxShadow = true,
  children,
  speedActions,
  ...props
}: Props) => {
  const scrollableNodeRef = React.useRef();
  const isWindows = window.versions.platform() === 'win32';

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
        {left && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
            }}
          >
            {left}
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
              sx={{ position: 'fixed', bottom: 120, right: 28 }}
            >
              {speedActions?.length ? (
                <SpeedDial
                  ariaLabel="Page SpeedDial"
                  direction="left"
                  FabProps={{
                    size: 'small',
                    sx: { background: (theme) => theme.palette.grey[800] },
                  }}
                  icon={(
                    <SpeedDialIcon
                      openIcon={(
                        <div onClick={handleScrollTop}>
                          <MdKeyboardArrowUp size={24} />
                        </div>
                      )}
                    />
                  )}
                >
                  {speedActions?.map(({ name, icon, onClick }) => (
                    <SpeedDialAction
                      key={name}
                      icon={icon}
                      tooltipTitle={name}
                      onClick={onClick}
                      sx={{
                        opacity: 1,
                        background: (theme) => theme.palette.grey[800],
                      }}
                      FabProps={{
                        size: 'medium',
                      }}
                    />
                  ))}
                </SpeedDial>
              ) : (
                <Fab sx={{ opacity: 0.5 }} size="small" aria-label="scroll back to top">
                  <MdKeyboardArrowUp size={24} />
                </Fab>
              )}
            </Box>
          </Fade>
        </SimpleBar>
      </Box>
    </Box>
  );
};

export default PageContainer;
