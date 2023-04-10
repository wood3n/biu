import React from 'react';
import { useBoolean } from 'ahooks';
import { Tooltip, Button } from 'antd';
import { TailSpin } from 'react-loader-spinner';
import classNames from 'classnames';
import { isThenable } from '@/common/utils';
import styles from './index.module.less';

interface Props {
  tooltip: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | ((e: React.MouseEvent<HTMLElement>) => Promise<any>);
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
}: React.PropsWithChildren<Props>) => {
  const [loading, { setTrue, setFalse }] = useBoolean(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = (e) => {
    e.stopPropagation();
    const returnOnClick = onClick(e);
    if (!isThenable(returnOnClick)) return;

    setTrue();
    (returnOnClick as Promise<any>).finally(() => {
      setFalse();
    });
  };

  return loading ? <TailSpin width={18} height={18} radius="2" /> : (
    <Tooltip title={tooltip}>
      <Button
        type="link"
        loading={loading}
        onClick={handleClick}
        className={classNames(className, styles.button)}
        style={style}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

export default TooltipButton;
