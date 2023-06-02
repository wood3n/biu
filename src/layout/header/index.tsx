import React from 'react';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdSettings,
} from 'react-icons/md';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Input from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import useUser from '@/store/user-atom';
import Search from '@components/search';
import './index.less';

interface Props {
  style?: React.CSSProperties;
}

const Header = ({
  style,
} : Props) => {
  const [user] = useUser();

  return (
    <div className="m-header" style={style}>
      <div className="navigation">
        <IconButton size="small">
          <MdKeyboardArrowLeft />
        </IconButton>
        <IconButton size="small">
          <MdKeyboardArrowRight />
        </IconButton>
      </div>
      <Search />
      <IconButton>
        <MdSettings />
      </IconButton>
    </div>
  );
};

export default Header;
