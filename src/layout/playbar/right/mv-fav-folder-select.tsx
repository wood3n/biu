import { Button, useDisclosure } from "@heroui/react";
import { RiStarLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import FavFolderSelect from "@/components/fav-folder/select";
import { getWebInterfaceView } from "@/service/web-interface-view";
import { usePlayingQueue } from "@/store/playing-queue";

const MvFavFolderSelect = () => {
  const { current } = usePlayingQueue();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: mvData } = useRequest(
    async () => {
      const res = await getWebInterfaceView({
        bvid: current?.bvid,
      });
      return res?.data;
    },
    {
      ready: Boolean(current?.bvid),
      refreshDeps: [current?.bvid],
    },
  );

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
