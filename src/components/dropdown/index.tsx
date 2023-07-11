import React from 'react';
import HoverMenu from 'material-ui-popup-state/HoverMenu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import {
  usePopupState,
  bindHover,
  bindMenu,
} from 'material-ui-popup-state/hooks';

interface Props {
  menus?: {
    key: React.Key;
    label: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLLIElement>
  }[];
}

const DropDown = ({ children, menus }: React.PropsWithChildren<Props>) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoMenu',
  });

  return (
    <>
      <IconButton size="small" {...bindHover(popupState)}>
        {children}
      </IconButton>
      <HoverMenu
        {...bindMenu(popupState)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {menus?.map(({ key, label, onClick }) => (
          <MenuItem
            key={key}
            onClick={(e) => {
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
};

export default DropDown;
