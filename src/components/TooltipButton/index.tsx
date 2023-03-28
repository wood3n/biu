import React from 'react';
import { Tooltip, Button } from 'antd';
import classNames from 'classnames';
import styles from './index.module.less';

interface Props {
  tooltip: React.ReactNode;
  onClick?: VoidFunction;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 带有tooltip提示的按钮
 */
const TooltipButton = ({
  tooltip,
  onClick,
  className,
  style,
  children,
}: React.PropsWithChildren<Props>) => (
  <Tooltip title={tooltip}>
    <Button
      type="link"
      onClick={onClick}
      className={classNames(className, styles.button)}
      style={style}
    >
      {children}
    </Button>
  </Tooltip>
);

export default TooltipButton;
