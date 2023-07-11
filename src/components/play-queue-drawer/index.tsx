import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useAtomValue } from 'jotai';
import { playQueueAtom } from '@/store/play-queue-atom';

interface Props {
  open: boolean;
  onClose: VoidFunction;
}

const PlayQueueDrawer: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const playQueue = useAtomValue(playQueueAtom);

  return (
    <Drawer
      anchor="right"
      PaperProps={{ style: { position: 'absolute' } }}
      BackdropProps={{ style: { position: 'absolute' } }}
      ModalProps={{
        container: document.getElementById('play-queue-drawer-container'),
        style: { position: 'absolute' },
      }}
      open={open}
      onClose={onClose}
    >
      测试
    </Drawer>
  );
};

export default PlayQueueDrawer;
