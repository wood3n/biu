import React, { useMemo } from "react";

import { Image } from "@heroui/react";

import Ellipsis from "@/components/ellipsis";
import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

import MvFavFolderSelect from "./mv-fav-folder-select";
import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const user = useUser(s => s.user);
  const { current } = usePlayingQueue();

  const title = useMemo(() => {
    if ((current?.pages?.length ?? 0) > 1) {
      return current?.pages?.find(item => item.pageIndex === current.currentPage)?.pageTitle;
    }

    return current?.title;
  }, [current]);

  if (!current) {
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-start space-x-4">
      <Image
        src={current.coverImageUrl}
        radius="sm"
        width={56}
        height={56}
        classNames={{
          wrapper: "flex-none",
        }}
        className="object-cover"
      />
      <div className="flex min-w-0 flex-col space-y-1">
        <Ellipsis>{title}</Ellipsis>
        {Boolean(current.singer) && <span className="truncate text-sm text-zinc-400">{current.singer}</span>}
      </div>
      <div className="flex items-center">
        {Boolean((current.pages?.length ?? 0) > 1) && <VideoPageList />}
        {Boolean(user?.isLogin) && <MvFavFolderSelect />}
      </div>
    </div>
  );
};

export default LeftControl;
