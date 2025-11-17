import { addToast, Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";
import log from "electron-log/renderer";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { useDownloadQueue } from "@/store/download-queue";
import { usePlayingQueue } from "@/store/playing-queue";

import { PlayBarIconSize } from "../constants";

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
    } catch (error) {
      log.error("[download]", error);
      addToast({
        title: "下载失败",
        color: "danger",
      });
    }
  };

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={download}>
      <RiDownload2Fill size={PlayBarIconSize.SideIconSize} />
    </Button>
  );
};

export default Download;
