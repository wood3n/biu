import React, { useState } from 'react';
import {
  MdPlayCircle,
} from 'react-icons/md';
import { useTheme, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import type { TooltipProps } from '@mui/material/Tooltip';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Image from '@/components/image';
import ListItemText from '@mui/material/ListItemText';
import OverflowText from '@components/overflow-text';
import { default as MUIListItem } from '@mui/material/ListItem';

const StyleTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    minWidth: 70,
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface Props {
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  title?: React.ReactNode;
  imgUrl?: string;
  trackCount?: number;
}

const ListItem: React.FC<Props> = ({
  selected,
  onClick,
  title,
  imgUrl,
  trackCount,
}) => {
  const theme = useTheme();
  const [hoverd, setHovered] = useState(false);

  return (
    <MUIListItem
      // @ts-expect-error
      button
      selected={selected}
      onClick={onClick}
      secondaryAction={hoverd && (
        <StyleTooltip
          title="播放歌单"
          PopperProps={{
            disablePortal: true,
          }}
        >
          <IconButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
            }}
          >
            <MdPlayCircle color={theme.palette.primary.main} />
          </IconButton>
        </StyleTooltip>
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ListItemAvatar
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Image
          width={48}
          height={48}
          src={imgUrl}
        />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        secondary={(
          <Typography
            variant="caption"
            color={(theme) => theme.palette.text.secondary}
            paddingTop="4px"
          >
            {`${trackCount}首歌曲`}
          </Typography>
        )}
      >
        <OverflowText title={title}>
          {title}
        </OverflowText>
      </ListItemText>
    </MUIListItem>
  );
};

export default ListItem;
