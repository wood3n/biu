import { Button, useDisclosure } from "@heroui/react";
import { RiStarLine } from "@remixicon/react";

import FavFolderSelect from "@/components/fav-folder/select";
import { usePlayQueue } from "@/store/play-queue";

const MvFavFolderSelect = () => {
  const mvData = usePlayQueue(s => {
    return s.list?.find(item => item.bvid === s.currentBvid);
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onOpen}>
        <RiStarLine size={18} />
      </Button>
      <FavFolderSelect title="收藏" rid={String(mvData?.aid)} isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default MvFavFolderSelect;
