import React from "react";
import { MdRepeat, MdRepeatOne, MdShuffle } from "react-icons/md";

import { bindHover, bindPopover, usePopupState } from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { PLAY_MODE } from "@/common/constants";

interface Props {
  value: PLAY_MODE;
  onChange: (v: PLAY_MODE) => void;
}

const PlayModeToggle: React.FC<Props> = ({ value, onChange }) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoPopover",
  });

  const iconsMap = {
    [PLAY_MODE.LOOP]: <MdRepeat size={24} />,
    [PLAY_MODE.SINGLE]: <MdRepeatOne size={24} />,
    [PLAY_MODE.RANDOM]: <MdShuffle size={24} />,
  };

  const handleChange = (_: React.MouseEvent<HTMLElement>, v: PLAY_MODE) => {
    if (v !== null) {
      onChange(v);
    }
  };

  return (
    <>
      <IconButton size="small" {...bindHover(popupState)}>
        {iconsMap[value]}
      </IconButton>
      <HoverPopover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <ToggleButtonGroup color="primary" size="small" exclusive value={value} onChange={handleChange}>
          <ToggleButton value={PLAY_MODE.LOOP}>
            <MdRepeat size={18} />
          </ToggleButton>
          <ToggleButton value={PLAY_MODE.SINGLE}>
            <MdRepeatOne size={18} />
          </ToggleButton>
          <ToggleButton value={PLAY_MODE.RANDOM}>
            <MdShuffle size={18} />
          </ToggleButton>
        </ToggleButtonGroup>
      </HoverPopover>
    </>
  );
};

export default PlayModeToggle;
