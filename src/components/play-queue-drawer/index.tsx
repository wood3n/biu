import * as React from "react";

import { useAtomValue } from "jotai";
import Drawer from "@mui/material/Drawer";

import { playQueueAtom } from "@/store/play-queue-atom";

interface Props {
  open: boolean;
  onClose: VoidFunction;
}

const PlayQueueDrawer: React.FC<Props> = ({ open, onClose }) => {
  const playQueue = useAtomValue(playQueueAtom);

  return (
    <Drawer
      anchor="right"
      PaperProps={{ style: { position: "absolute" } }}
      BackdropProps={{ style: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("play-queue-drawer-container"),
        style: { position: "absolute" },
      }}
      open={open}
      onClose={onClose}
    >
      测试
    </Drawer>
  );
};

export default PlayQueueDrawer;
