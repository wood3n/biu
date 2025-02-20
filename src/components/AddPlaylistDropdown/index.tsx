import React from "react";
import { MdSearch } from "react-icons/md";

import { Divider, Input, Modal, theme } from "antd";
import { useAtomValue } from "jotai";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { userAtom } from "@/store/user-atom";
import { userPlaylistAtom } from "@/store/user-playlist-atom";

import "./index.less";

interface Props {
  visible: boolean;
  onClose: VoidFunction;
}

function AddPlaylistDropdown({ visible, onClose }: Props) {
  const { token } = theme.useToken();
  const user = useAtomValue(userAtom);
  const userPlaylist = useAtomValue(userPlaylistAtom);

  return (
    <Modal open={visible} onCancel={onClose}>
      <Input prefix={<MdSearch />} placeholder="查找歌单" style={{ borderRadius: 4 }} />
      <Divider style={{ margin: 0 }} />
      <OverlayScrollbarsComponent style={{ height: 300, width: 320 }}>
        <div style={{ height: 300, width: 320 }}>歌单</div>
      </OverlayScrollbarsComponent>
    </Modal>
  );
}

export default AddPlaylistDropdown;
