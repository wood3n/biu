import React from "react";

import { bindHover, bindMenu, usePopupState } from "material-ui-popup-state/hooks";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";

interface Props {
  menus?: {
    key: React.Key;
    label: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLLIElement>;
  }[];
}

function DropDown({ children, menus }: React.PropsWithChildren<Props>) {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoMenu",
  });

  return (
    <>
      <IconButton size="small" {...bindHover(popupState)}>
        {children}
      </IconButton>
      <HoverMenu {...bindMenu(popupState)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }}>
        {menus?.map(({ key, label, onClick }) => (
          <MenuItem
            key={key}
            onClick={e => {
              onClick(e);
              popupState.close();
            }}
          >
            {label}
          </MenuItem>
        ))}
      </HoverMenu>
    </>
  );
}

export default DropDown;
