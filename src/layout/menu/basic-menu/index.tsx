import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  MdRadio,
  MdHistory,
  MdRecommend,
} from 'react-icons/md';

interface Props {
  selectedKeys: string[];
}

const BasicMenu = ({ selectedKeys }: Props) => {
  const navigate = useNavigate();

  return (
    <List>
      {[
        {
          label: '推荐',
          icon: <MdRecommend />,
          key: '/',
        },
        {
          label: '私人FM',
          icon: <MdRadio />,
          key: '/fm',
        },
        {
          label: '播放历史',
          icon: <MdHistory />,
          key: '/history',
        },
      ].map(({ label, icon, key }) => (
        <ListItem key={key}>
          <ListItemButton
            selected={selectedKeys.includes(key)}
            onClick={() => {
              navigate(key);
            }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default BasicMenu;
