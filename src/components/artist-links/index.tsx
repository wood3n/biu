import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import {
  MdOutlineMoreHoriz,
} from 'react-icons/md';
import type { Ar } from '@/service/recommend-songs';
import OverflowText from '../overflow-text';
import DropDown from '../dropdown';

interface Props {
  ars: Ar[];
}

/**
 * 艺术家链接
 */
const ArtistLinks: React.FC<Props> = ({
  ars,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {ars?.slice(0, 3)?.map<React.ReactNode>(({ id, name: arName }, i) => (
        <React.Fragment key={id}>
          {i ? <>,&nbsp;</> : ''}
          <OverflowText
            link
            variant="caption"
            color={(theme) => theme.palette.text.secondary}
            onClick={() => navigate(`/artist/${id}`)}
            title={arName}
            sx={{
              maxWidth: ars.length > 1 ? 90 : undefined,
              minWidth: 0,
              cursor: 'pointer',
            }}
          >
            {arName}
          </OverflowText>
        </React.Fragment>
      ))}
      {ars?.length > 3 && (
        <DropDown menus={ars?.slice(3).map(({ id, name: arName }) => ({
          key: id,
          label: arName,
          onClick: () => navigate(`/artist/${id}`),
        }))}
        >
          <MdOutlineMoreHoriz size={14} />
        </DropDown>
      )}
    </Box>
  );
};

export default ArtistLinks;
