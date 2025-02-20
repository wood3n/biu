import React, { useState } from "react";
import { MdPlayCircle } from "react-icons/md";

import IconButton from "@mui/material/IconButton";
import { default as MUIListItem } from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";
import type { TooltipProps } from "@mui/material/Tooltip";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

import Image from "@/components/image";
import OverflowText from "@/components/overflow-text";
import type { Artist } from "@/service/album-sublist";

const StyleTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    minWidth: 70,
    display: "flex",
    justifyContent: "center",
  },
}));

interface Props {
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  name?: React.ReactNode;
  imgUrl?: string;
  ars?: Artist[];
}

const AlbumListItem: React.FC<Props> = ({ selected, onClick, name, imgUrl, ars }) => {
  const theme = useTheme();
  const [hoverd, setHovered] = useState(false);

  const arNames = ars?.map(({ name }) => name)?.reduce((prev, next) => `${prev}，${next}`);

  return (
    <MUIListItem
      // @ts-expect-error
      button
      selected={selected}
      onClick={onClick}
      secondaryAction={
        hoverd && (
          <StyleTooltip
            title="播放专辑"
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
        )
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ListItemAvatar
        sx={{
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <Image width={48} height={48} src={imgUrl} />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        secondary={
          <OverflowText
            arrow
            paragraph
            variant="caption"
            title={arNames}
            color={theme => theme.palette.text.secondary}
            style={{
              paddingTop: "4px",
              margin: 0,
            }}
          >
            {arNames}
          </OverflowText>
        }
      >
        <OverflowText title={name}>{name}</OverflowText>
      </ListItemText>
    </MUIListItem>
  );
};

export default AlbumListItem;
