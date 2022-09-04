import { useState } from 'react';
import './index.css';

interface Props {
  onClick: React.MouseEventHandler<HTMLSpanElement> | undefined;
  color: string;
  children: React.ReactNode;
}

const ActionBadge: React.FC<Props> = ({
  onClick,
  color,
  children
}) => {
  const [avtive, setActive] = useState(false);

  return (
    <span
      className='action-badge'
      onMouseOver={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={onClick}
      style={{ background: color }}
    >
      {avtive && children}
    </span>
  );
};

export default ActionBadge;