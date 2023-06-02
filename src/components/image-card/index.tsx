import React, { useState } from 'react';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import { MdStarBorder, MdOutlinePlayCircleFilled } from 'react-icons/md';
import TooltipButton from '../tooltip-button';
import OverflowText from '../overflow-text';
import './index.less';

interface Props {
  imgUrl?: string;
  title: React.ReactNode;
  onClick?: VoidFunction;
}

const ImageCard: React.FC<Props> = ({
  imgUrl,
  title,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <ImageListItem
      component="div"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      sx={{
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      <Fade timeout={300} in={hovered}>
        <ImageListItemBar
          sx={{
            background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, '
            + 'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
          position="top"
          actionIcon={(
            <TooltipButton
              tooltip="收藏"
              sx={{ color: 'white' }}
            >
              <MdStarBorder />
            </TooltipButton>
          )}
          actionPosition="left"
        />
      </Fade>
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
            title={title}
            placement="top"
            PopperProps={{
              disablePortal: false,
            }}
          >
            {title}
          </OverflowText>
        )}
        sx={{
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
        }}
        actionIcon={(
          <Fade timeout={300} in={hovered}>
            <IconButton>
              <MdOutlinePlayCircleFilled size={32} color="#1abc9c" />
            </IconButton>
          </Fade>
        )}
      />
    </ImageListItem>
  );
};

export default ImageCard;
