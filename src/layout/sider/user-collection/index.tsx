import { useState } from 'react';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ImageList from '@mui/material/ImageList';
import Chip from '@components/chip';
import ScrollObserverTarget from '@/components/scroll-observer-target';
import { useUserArs } from '@/store/user-ars-atom';
import { useUserAls } from '@/store/user-als-atom';
import SimpleBar from 'simplebar-react';
import AlbumListItem from './album-list-item';
import ArtistListItem from './artist-list-item';

const UserCollection = () => {
  const [userArs] = useUserArs();
  const [userAls] = useUserAls();
  const [tab, setTab] = useState('专辑');

  return (
    <SimpleBar style={{ height: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'sticky',
          top: 0,
          padding: '12px 16px',
          background: '#1E1E1E',
          zIndex: 2,
        }}
        id="user-collection-chip-tab"
      >
        <Chip
          size="small"
          label="专辑"
          clickable
          color="primary"
          variant={tab === '专辑' ? 'filled' : 'outlined'}
          onClick={() => setTab('专辑')}
        />
        <Chip
          size="small"
          label="歌手"
          clickable
          color="primary"
          variant={tab === '歌手' ? 'filled' : 'outlined'}
          onClick={() => setTab('歌手')}
        />
      </Stack>
      <ScrollObserverTarget
        searchInParent
        stickyElSelector="#user-collection-chip-tab"
      />
      {tab === '专辑' ? (
        <List sx={{ padding: 0 }}>
          {userAls?.map(({
            id, name, picUrl, artists,
          }) => (
            <AlbumListItem
              key={id}
              name={name}
              imgUrl={picUrl}
              ars={artists}
              onClick={() => {}}
            />
          ))}
        </List>
      ) : (
        <ImageList cols={2} gap={8} sx={{ padding: '0 16px' }}>
          <>
            {userArs?.map(({ id, name, picUrl }) => (
              <ArtistListItem
                key={id}
                name={name}
                imgUrl={picUrl}
                onClick={() => {}}
              />
            ))}
          </>
        </ImageList>
      )}
    </SimpleBar>
  );
};

export default UserCollection;
