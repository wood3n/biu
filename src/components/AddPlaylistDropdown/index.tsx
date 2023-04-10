import React from 'react';
import {
  Typography, Dropdown, Divider, theme, Input,
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

const AddPlaylistDropdown = ({
  children,
}: React.PropsWithChildren) => {
  const { token } = theme.useToken();
  const user = useAtomValue(userAtom);
  const userPlaylist = useAtomValue(userPlaylistAtom);

  return (
    <Dropdown
      menu={{
        items: userPlaylist?.slice(1, user?.userAccountStats?.createdPlaylistCount)?.map(({ id, name }) => ({
          key: id,
          label: (
            <Typography.Text
              ellipsis
              style={{ width: 240 }}
            >
              {name}
            </Typography.Text>
          ),
          icon: <MdQueueMusic />,
        })) ?? [],
      }}
      dropdownRender={(menu) => (
        <div
          style={{
            backgroundColor: token.colorBgElevated,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
          }}
        >
          <a type="link" className="playlist-add-btn">
            <MdPlaylistAdd size={16} />
            创建新歌单
          </a>
          <Divider style={{ margin: 0 }} />
          <div className="playlist-search">
            <Input prefix={<MdSearch />} placeholder="查找歌单" style={{ borderRadius: 4 }} />
          </div>
          <Divider style={{ margin: 0 }} />
          <SimpleBar style={{ height: 300, width: 320 }}>
            <div style={{ height: 300, width: 320 }}>{menu}</div>
          </SimpleBar>
        </div>
      )}
    >
      {children}
    </Dropdown>
  );
};

export default AddPlaylistDropdown;
