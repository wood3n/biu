import { Button } from "@heroui/react";
import { RiDownload2Fill } from "@remixicon/react";

import { useDownloadQueue } from "@/store/download-queue";
import { usePlayList } from "@/store/play-list";

import { PlayBarIconSize } from "../constants";

const Download = () => {
  const addDownloadTask = useDownloadQueue(s => s.add);

  const download = async () => {
    const playItem = usePlayList.getState().getPlayItem();

    addDownloadTask({
      bvid: playItem?.bvid as string,
      cid: playItem?.cid as string,
      title: playItem?.pageTitle as string,
      coverImgUrl: playItem?.cover as string,
    });
  };

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={download}>
      <RiDownload2Fill size={PlayBarIconSize.SideIconSize} />
    </Button>
  );
};

export default Download;
