import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useUserPlaylist } from '@/store/user-playlist-atom';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * 创建歌单
 */
const CreatePlayListModal: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const { refresh, add } = useUserPlaylist();

  const handleAddPlaylist = () => {

  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>新建歌单</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id="name"
          label="歌单名称"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAddPlaylist}>确定</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlayListModal;
