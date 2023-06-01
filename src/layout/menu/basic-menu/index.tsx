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
          icon: <MdRecommend size={24} />,
          key: '/',
        },
        {
          label: '私人FM',
          icon: <MdRadio size={24} />,
          key: '/fm',
        },
        {
          label: '播放历史',
          icon: <MdHistory size={24} />,
          key: '/history',
        },
      ].map(({ label, icon, key }) => (
        <ListItem key={key} disablePadding>
          <ListItemButton
            selected={selectedKeys.includes(key)}
            onClick={() => {
              navigate(key);
            }}
          >
            <ListItemIcon>
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
