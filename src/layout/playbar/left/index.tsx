import React, { useMemo } from "react";

import { Chip, Image, Link } from "@heroui/react";

import Ellipsis from "@/components/ellipsis";
import { usePlayQueue } from "@/store/play-queue";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const currentCid = usePlayQueue(s => s.currentCid);
  const mvData = usePlayQueue(s => {
    return s.list.find(item => item.bvid === s.currentBvid);
  });

  const info = useMemo(() => {
    const pageData = mvData?.pages?.find(item => item.cid === currentCid);
    const hasPages = (mvData?.pages?.length ?? 0) > 1;

    return {
      hasPages,
      title: hasPages ? pageData?.title : mvData?.title,
      coverImageUrl: hasPages ? pageData?.cover : mvData?.cover,
      isLossless: pageData?.isLossless,
      ownerName: mvData?.ownerName,
      ownerId: mvData?.ownerMid,
    };
  }, [currentCid, mvData]);

  return (
    <div className="flex h-full w-full items-center justify-start space-x-4">
      <Image
        radius="md"
        src={info.coverImageUrl}
        width={56}
        height={56}
        classNames={{
          wrapper: "flex-none",
        }}
        className="object-cover"
      />
      <div className="flex min-w-0 flex-col space-y-1">
        <span className="flex items-center space-x-2">
          <Ellipsis>{info.title}</Ellipsis>
          {Boolean(info.isLossless) && <Chip size="sm">无损</Chip>}
        </span>
        {Boolean(info.ownerName) && (
          <Link href={`/user/${info.ownerId}`} className="text-foreground-500 text-sm hover:underline">
            {info.ownerName}
          </Link>
        )}
      </div>
      {Boolean(info.hasPages) && <VideoPageList />}
    </div>
  );
};

export default LeftControl;
