import React, { useState } from 'react';
import {
  MdPlaylistAdd,
} from 'react-icons/md';

interface Props {
  className?: string;
  addPlayList: () => void;
}

const CreatedListMenuTitle: React.FC<Props> = ({
  className,
  addPlayList,
}) => {
  const [active, setActive] = useState(false);

  return (
    <span
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={className}
    >
      创建的歌单
      {active
        && (
          <a onClick={(e) => {
            e.stopPropagation();
            addPlayList();
          }}
          >
            <MdPlaylistAdd size={18} style={{ verticalAlign: '-0.25em' }} />
          </a>
        )}
    </span>
  );
};

export default CreatedListMenuTitle;
