import React, { useMemo, useRef, useState } from "react";

import { Image as Img } from "@heroui/react";

import If from "../if";
import ImageCard from "../image-card";
import PlaylistToolbar from "../playlist-toolbar";
import ScrollContainer, { type ScrollRefObject } from "../scroll-container";
import SongList from "../song-list";
import StickyHeader from "../sticky-header";
import Skeleton from "./skeleton";

interface Owner {
  userId?: number;
  name?: string;
  avatarUrl?: string;
  link?: string;
}

interface Props {
  loading: boolean;
  coverImageUrl?: string;
  title?: string;
  description?: React.ReactNode;
  owner?: Owner;
  songs?: Song[];
  extraTool?: React.ReactNode;
  hideAlbum?: boolean;
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
}

const PlaylistPage = ({
  loading,
  coverImageUrl,
  title,
  description,
  owner,
  songs,
  extraTool,
  hideAlbum,
  hasMore,
  loadMore,
}: Props) => {
  const [palette, setPalette] = useState<[number, number, number] | null>(null);
  const [search, setSearch] = useState<string>();

  const scrollerRef = useRef<ScrollRefObject>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const filteredSongs = useMemo(() => {
    if (!search?.trim()) {
      return songs;
    }

    const searchContent = search.trim().toLowerCase();

    return songs?.filter(
      song =>
        song.name?.toLowerCase()?.includes(searchContent) ||
        song.ar?.some(ar => ar.name?.toLowerCase()?.includes(searchContent)) ||
        song.al?.name?.toLowerCase()?.includes(searchContent),
    );
  }, [songs, search]);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full">
      <If condition={Boolean(songs?.length)}>
        <StickyHeader
          observerTarget={toolbarRef}
          observerRoot={scrollerRef.current?.osInstance()?.elements().target}
          gradientColor={`rgba(${palette?.join(",")},40%)`}
        >
          <div className="flex items-center space-x-2">
            <Img src={coverImageUrl} className="h-10 w-10" />
            <span className="truncate">{title}</span>
          </div>
          <PlaylistToolbar isIconOnly songs={songs!} extra={extraTool} />
        </StickyHeader>
      </If>
      <ImageCard
        coverImageUrl={coverImageUrl}
        title={title}
        description={description}
        user={owner}
        onLoadColor={setPalette}
      />
      <div className="p-6">
        <If condition={Boolean(songs?.length)}>
          <PlaylistToolbar showSearch ref={toolbarRef} songs={songs!} onSearch={setSearch} className="mb-4" />
        </If>
        <SongList
          loading={loading}
          songs={filteredSongs}
          hideAlbum={hideAlbum}
          getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement}
          virtualScrollMargin={60}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </div>
    </ScrollContainer>
  );
};

export default PlaylistPage;
