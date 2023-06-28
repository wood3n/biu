import React from 'react';
import Stack from '@mui/material/Stack';
import type { Ar } from '@/service/recommend-songs';
import Image from '../image';
import OverflowText from '../overflow-text';
import ArtistLinks from '../artist-links';

interface Props {
  picUrl?: string;
  name?: string;
  ar: Ar[];
  noCopyrightRcmd?: NoCopyrightRcmd;
}

/**
 * 歌曲信息描述、图片、歌名、歌手名
 */
const SongDescription: React.FC<Props> = ({
  picUrl,
  name,
  ar,
  noCopyrightRcmd,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={2}
    sx={{
      minWidth: 0,
    }}
  >
    {picUrl && (
      <Image
        width={50}
        height={50}
        src={picUrl}
      />
    )}
    <Stack spacing="4px" sx={{ minWidth: 0 }}>
      <OverflowText
        PopperProps={{ disablePortal: false }}
        title={name}
        sx={{
          maxWidth: 220,
          color: (theme) => (noCopyrightRcmd ? theme.palette.text.secondary : theme.palette.text.primary),
        }}
      >
        {name}
      </OverflowText>
      <ArtistLinks ars={ar} />
    </Stack>
  </Stack>
);

export default SongDescription;
