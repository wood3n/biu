import React from 'react';
import {
  Typography, Divider, theme, Input, Modal,
} from 'antd';
import {
  MdQueueMusic,
  MdPlaylistAdd,
  MdSearch,
} from 'react-icons/md';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/store/userAtom';
import { userPlaylistAtom } from '@/store/userPlaylistAtom';
import SimpleBar from 'simplebar-react';
import './index.less';

interface Props {
  visible: boolean;
  onClose: VoidFunction;
}

const AddPlaylistDropdown = ({
  visible,
  onClose,
}: Props) => {
  const { token } = theme.useToken();
  const user = useAtomValue(userAtom);
  const userPlaylist = useAtomValue(userPlaylistAtom);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
    >
      <Input prefix={<MdSearch />} placeholder="查找歌单" style={{ borderRadius: 4 }} />
      <Divider style={{ margin: 0 }} />
      <SimpleBar style={{ height: 300, width: 320 }}>
        <div style={{ height: 300, width: 320 }}>歌单</div>
      </SimpleBar>
    </Modal>
  );
};

export default AddPlaylistDropdown;
