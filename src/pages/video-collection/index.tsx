import React, { useMemo } from "react";
import { useSearchParams } from "react-router";

import { CollectionType } from "@/common/constants/collection";
import ScrollContainer from "@/components/scroll-container";

import Favorites from "./favorites";
import VideoCollectionInfo from "./video-series";

const Folder: React.FC = () => {
  const [searchParams] = useSearchParams();

  const folderType = useMemo(
    () => Number(searchParams.get("type") || CollectionType.Favorite) as CollectionType,
    [searchParams],
  );

  return (
    <ScrollContainer className="h-full w-full">
      <div className="w-full p-4">
        {folderType === CollectionType.Favorite && <Favorites />}
        {folderType === CollectionType.VideoSeries && <VideoCollectionInfo />}
      </div>
    </ScrollContainer>
  );
};

export default Folder;
