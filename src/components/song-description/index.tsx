import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { MdOutlineMoreHoriz } from 'react-icons/md';
import type { Ar } from '@/service/recommend-songs';
import Image from '../image';
import OverflowText from '../overflow-text';
import DropDown from '../dropdown';

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
}) => {
  const navigate = useNavigate();

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {ar?.slice(0, 3)?.map<React.ReactNode>(({ id, name: arName }, i) => (
            <React.Fragment key={id}>
              {i ? <>,&nbsp;</> : ''}
              <OverflowText
                link
                variant="caption"
                color={(theme) => theme.palette.text.secondary}
                onClick={() => navigate(`/artist/${id}`)}
                title={arName}
                sx={{
                  maxWidth: ar.length > 1 ? 90 : undefined,
                  minWidth: 0,
                }}
              >
                {arName}
              </OverflowText>
            </React.Fragment>
          ))}
          {ar?.length > 3 && (
            <DropDown menus={ar?.slice(3).map(({ id, name: arName }) => ({
              key: id,
              label: arName,
              onClick: () => navigate(`/artist/${id}`),
            }))}
            >
              <MdOutlineMoreHoriz size={18} />
            </DropDown>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default SongDescription;
