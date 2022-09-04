import * as React from 'react';
import classnames from 'classnames';
import { ReactComponent as Close } from '@/assets/images/close.svg';
import { ReactComponent as Minimize } from '@/assets/images/minimize.svg';
import { ReactComponent as FullScreen } from '@/assets/images/fullscreen.svg';
import { ReactComponent as OffScreen } from '@/assets/images/offscreen.svg';
import ActionBadge from './action-badge';
import { win } from '@/common/utils/renderer';

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

const WindowAction: React.FC<Props> = ({
  style,
  className
}) => {
  return (
    <div className={classnames('win-action', className)} style={style}>
      <ActionBadge
        color='hsl(356deg 74% 63%)'
        onClick={e => {
          e.preventDefault();
          win.close();
        }}
      >
        <Close />
      </ActionBadge>
      <ActionBadge
        color='hsl(33deg 73% 58%)'
        onClick={e => {
          e.preventDefault();
          win.min();
        }}
      >
        <Minimize />
      </ActionBadge>
      <ActionBadge
        color='hsl(99deg 41% 52%)'
        onClick={e => {
          e.preventDefault();
          win.resize();
        }}
      >
        {win.isMaximized() ?
          <OffScreen /> :
          <FullScreen />}
      </ActionBadge>
    </div>
  );
};

export default WindowAction;
