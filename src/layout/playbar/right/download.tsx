import { Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";

import { useDownloadQueue } from "@/store/download-queue";
import { usePlayQueue } from "@/store/play-queue";

import { PlayBarIconSize } from "../constants";

const Download = () => {
  const currentBvid = usePlayQueue(s => s.currentBvid);
  const currentCid = usePlayQueue(s => s.currentCid);
  const list = usePlayQueue(s => s.list);
  const mvData = list.find(item => item.bvid === currentBvid);
  const pageData = mvData?.pages?.find(item => item.cid === currentCid);
  const addDownloadTask = useDownloadQueue(s => s.add);

  const download = async () => {
    if (!currentBvid || !currentCid) {
      return;
    }

    addDownloadTask({
      bvid: currentBvid,
      cid: currentCid,
      title: pageData?.title as string,
      coverImgUrl: pageData?.cover as string,
    });
  };

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={download}>
      <RiDownload2Fill size={PlayBarIconSize.SideIconSize} />
    </Button>
  );
};

export default Download;
