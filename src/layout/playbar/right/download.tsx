import { useNavigate } from "react-router";

import { addToast, Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";

import { getPlayerPagelist } from "@/service/player-pagelist";
import { useDownloadQueue } from "@/store/download-queue";
import { usePlayingQueue } from "@/store/playing-queue";

const Download = () => {
  const { current } = usePlayingQueue();
  const { add: addToDownloadQueue } = useDownloadQueue();
  const navigate = useNavigate();

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

      addToDownloadQueue({
        bvid: current.bvid,
        cid: String(cid),
        title: current.title,
        coverImgUrl: (current as any)?.coverImageUrl || "",
      });

      addToast({
        title: "已添加到下载列表",
        color: "success",
        endContent: (
          <Button size="sm" variant="flat" onPress={() => navigate("/download-list")}>
            查看
          </Button>
        ),
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
