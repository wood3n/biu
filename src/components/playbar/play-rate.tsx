import React from "react";

import type { ButtonProps } from "@mui/material/Button";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";

interface Props {
  value: number;
  onChange: (rate: number) => void;
}

const ColorButton = styled(Button)<ButtonProps>(() => ({
  minWidth: 48,
  color: "#fff",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
}));

const PlayRate: React.FC<Props> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChange = (v: number) => {
    onChange(v);
    setAnchorEl(null);
  };

  return (
    <>
      <ColorButton variant="text" onClick={handleClick} size="small">
        {`${value}x`}
      </ColorButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {[0.5, 1, 1.5, 2].map(v => (
          <MenuItem key={String(v)} onClick={() => handleChange(v)}>{`${v}x`}</MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default PlayRate;
