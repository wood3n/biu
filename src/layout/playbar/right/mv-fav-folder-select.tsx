import { useMemo } from "react";

import { Button } from "@heroui/react";
import { RiStarLine } from "@remixicon/react";

import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";

const MvFavFolderSelect = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const onOpenFavSelectModal = useModalStore(s => s.onOpenFavSelectModal);

  const handleOpen = () => {
    if (!playItem) return;
    onOpenFavSelectModal({
      rid: playItem.type === "mv" ? String(playItem.aid) : String(playItem.sid),
      title: "收藏",
    });
  };

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={handleOpen}>
      <RiStarLine size={18} />
    </Button>
  );
};

export default MvFavFolderSelect;
