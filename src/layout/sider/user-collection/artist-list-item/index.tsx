import React from 'react';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import OverflowText from '@/components/overflow-text';

interface Props {
  onClick?: React.MouseEventHandler<HTMLElement>;
  name?: React.ReactNode;
  imgUrl?: string;
}

const ArtistListItem = ({
  name,
  imgUrl,
  onClick,
}: Props) => (
  <ImageListItem
    onClick={onClick}
    sx={{
      cursor: 'pointer',
    }}
  >
    <img
      src={imgUrl}
      loading="lazy"
      style={{
        borderRadius: '8px',
      }}
    />
    <ImageListItemBar
      title={(
        <OverflowText
          title={name}
          placement="top"
          style={{ maxWidth: '120px' }}
        >
          {name}
        </OverflowText>
      )}
      position="below"
    />
  </ImageListItem>
);

export default ArtistListItem;
