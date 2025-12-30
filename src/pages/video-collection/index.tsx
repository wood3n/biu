import React, { useMemo } from "react";
import { useSearchParams } from "react-router";

import { CollectionType } from "@/common/constants/collection";

import Favorites from "./favorites";
import VideoSeries from "./series";

const Folder = () => {
  const [searchParams] = useSearchParams();

  const collectionType = useMemo(
    () => Number(searchParams.get("type") || CollectionType.Favorite) as CollectionType,
    [searchParams],
  );

  return (
    <>
      {collectionType === CollectionType.Favorite && <Favorites />}
      {collectionType === CollectionType.VideoSeries && <VideoSeries />}
    </>
  );
};

export default Folder;
