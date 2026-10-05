import React, { useMemo } from "react";
import { useSearchParams } from "react-router";

import { CollectionType } from "@/common/constants/collection";

import VideoCollections from "./collections";
import Favorites from "./favorites";
import BBPFavorites from "./favorites/bbp-index";
import Series from "./series";

const Folder = () => {
  const [searchParams] = useSearchParams();

  const collectionType = useMemo(
    () => Number(searchParams.get("type") || CollectionType.Favorite) as CollectionType,
    [searchParams],
  );

  const source = searchParams.get("source");

  if (source === "bbplayer") {
    return <BBPFavorites />;
  }

  return (
    <>
      {collectionType === CollectionType.Favorite && <Favorites />}
      {collectionType === CollectionType.VideoCollections && <VideoCollections />}
      {collectionType === CollectionType.VideoSeries && <Series />}
    </>
  );
};

export default Folder;
