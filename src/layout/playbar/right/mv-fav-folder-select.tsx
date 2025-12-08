import { useMemo } from "react";

import { Button, useDisclosure } from "@heroui/react";
import { RiStarLine } from "@remixicon/react";

import FavFolderSelect from "@/components/fav-folder/select";
import { usePlayList } from "@/store/play-list";

const MvFavFolderSelect = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onOpen}>
        <RiStarLine size={18} />
      </Button>
      <FavFolderSelect
        title="收藏"
        rid={playItem?.type === "mv" ? String(playItem?.aid) : String(playItem?.sid)}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
};

export default MvFavFolderSelect;
