import React from "react";
import { MdClose, MdOutlineFullscreen, MdRemove } from "react-icons/md";

import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

/**
 * 窗口关闭等按钮操作
 */
const WindowAction: React.FC = () => (
  <Stack spacing={1} direction="row">
    <IconButton size="small">
      <MdRemove size={18} />
    </IconButton>
    <IconButton size="small">
      <MdOutlineFullscreen size={18} />
    </IconButton>
    <IconButton size="small">
      <MdClose size={18} />
    </IconButton>
  </Stack>
);

export default WindowAction;
