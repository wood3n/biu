import React from 'react';
import SimpleBar from 'simplebar-react';
import { type Props as SimpleBarProps } from 'simplebar-react/dist';
import Box from '@mui/material/Box';
import Search from '@components/search';
import ScrollObserverTarget from '@/components/scroll-observer-target';
import WindowAction from '@components/window-action';
import './index.less';

interface Props extends SimpleBarProps {
  extra?: React.ReactNode;
  observeScroll?: boolean;
  children: React.ReactNode;
}

const PageContainer = ({
  extra,
  observeScroll = true,
  children,
  ...props
}: Props) => {
  const isWindows = window.versions.platform() === 'win32';

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
      >
        {extra && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
            }}
          >
            {extra}
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
        <SimpleBar {...props} style={{ height: '100%' }}>
          {observeScroll && <ScrollObserverTarget stickyElSelector="#main-page-header" />}
          {children}
        </SimpleBar>
      </Box>
    </Box>
  );
};

export default PageContainer;
