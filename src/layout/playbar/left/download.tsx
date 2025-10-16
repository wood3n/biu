import { addToast, Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { getPlayerPlayurl } from "@/service/player-playurl";
import { usePlayingQueue } from "@/store/playing-queue";

const Download = () => {
  const { current } = usePlayingQueue();

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

      const getUrlRes = await getPlayerPlayurl({
        bvid: current.bvid,
        cid,
        fnval: 16,
        fnver: 0,
        fourk: 1,
      });

      const videoUrl = getUrlRes?.data?.dash?.video?.[0]?.baseUrl || getUrlRes?.data?.dash?.video?.[0]?.backupUrl?.[0];
      const audioUrl = getUrlRes?.data?.dash?.audio?.[0]?.baseUrl || getUrlRes?.data?.dash?.audio?.[0]?.backupUrl?.[0];
      if (videoUrl && audioUrl) {
        await window.electron.startDownload({
          title: current.title,
          videoUrl: videoUrl,
          audioUrl: audioUrl,
        });
      } else {
        addToast({
          title: "无法获取视频下载地址",
          color: "danger",
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        title: "下载失败",
        color: "danger",
      });
    }
  };

  return (
    <Button isIconOnly size="sm" variant="light" onPress={download}>
      <RiDownload2Fill size={18} />
    </Button>
  );
};

export default Download;
