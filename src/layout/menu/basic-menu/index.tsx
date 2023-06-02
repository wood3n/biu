import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import {
  MdRadio,
  MdHistory,
  MdRecommend,
  MdOutlineWbCloudy,
} from 'react-icons/md';

interface Props {
  selectedKeys: string[];
}

const BasicMenu = ({ selectedKeys }: Props) => {
  const navigate = useNavigate();

  return (
    <ToggleButtonGroup
      color="primary"
      value={selectedKeys[0]}
      exclusive
      onChange={(_, key) => {
        navigate(key);
      }}
    >
      {[
        {
          label: '推荐',
          icon: <MdRecommend size={22} />,
          key: '/',
        },
        {
          label: '私人FM',
          icon: <MdRadio size={22} />,
          key: '/fm',
        },
        {
          label: '云盘',
          icon: <MdOutlineWbCloudy size={22} />,
          key: '/drive',
        },
        {
          label: '播放历史',
          icon: <MdHistory size={22} />,
          key: '/history',
        },
      ].map(({ label, icon, key }) => (
        <ToggleButton key={key} value={key} sx={{ flex: 1 }}>
          {icon}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    // <List>
    //   {.map(({ label, icon, key }) => (
    //     <ListItem key={key} disablePadding>
    //       <ListItemButton
    //         selected={selectedKeys.includes(key)}
    //         onClick={() => {
    //           navigate(key);
    //         }}
    //       >
    //         <ListItemIcon>
    //           {icon}
    //         </ListItemIcon>
    //         <ListItemText primary={label} />
    //       </ListItemButton>
    //     </ListItem>
    //   ))}
    // </List>
  );
};

export default BasicMenu;
