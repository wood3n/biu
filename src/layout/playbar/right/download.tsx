import { addToast, Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { useDownloadQueue } from "@/store/download-queue";
import { usePlayingQueue } from "@/store/playing-queue";

const Download = () => {
  const { current } = usePlayingQueue();
  const { add: addToDownloadQueue } = useDownloadQueue();

  const download = async () => {
    if (!current?.bvid) {
      return;
    }

    try {
      let cid = current.cid as number;
      if (!cid) {
        const getPageRes = await getPlayerPagelist({
          bvid: current.bvid,
        });

        cid = getPageRes?.data?.find(item => item.page === (current.currentPage ?? 1))?.cid as number;
      }

      await addToDownloadQueue({
        bvid: current.bvid,
        cid: String(cid),
        title: current.title,
        coverImgUrl: (current as any)?.coverImageUrl || "",
      });
    } catch {
      addToast({
        title: "下载失败",
        color: "danger",
      });
    }
  };

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={download}>
      <RiDownload2Fill size={18} />
    </Button>
  );
};

export default Download;
