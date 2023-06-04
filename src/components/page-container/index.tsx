import React from 'react';
import SimpleBar from 'simplebar-react';
import { type Props as SimpleBarProps } from 'simplebar-react/dist';

interface Props extends SimpleBarProps {
  children: React.ReactNode;
}

const PageContainer = ({ children, ...props }: Props) => (
  <SimpleBar {...props} style={{ height: '100%' }}>
    {children}
  </SimpleBar>
);

export default PageContainer;
