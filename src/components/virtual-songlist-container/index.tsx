import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { BreadcrumbItem, Breadcrumbs, Image as Img, User } from "@heroui/react";
import ColorThief from "colorthief";

import Ellipsis from "../ellipsis";
import If from "../if";
import ScrollContainer, { type ScrollRefObject } from "../scroll-container";
import { VirtualSongList } from "../song-list";
import SongListToolbar from "../song-list-toolbar";
import StickyHeader from "../sticky-header";
import Skeleton from "./skeleton";

interface UserInfo {
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
  trackCount?: number;
  user?: UserInfo | UserInfo[];
  songs?: Song[];
  extraTool?: React.ReactNode;
  hideAlbum?: boolean;
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
}

const VirtualSongListContainer = ({
  loading,
  coverImageUrl,
  title,
  description,
  trackCount,
  user,
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
  const colorThief = useRef(new ColorThief());

  const navigate = useNavigate();

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
        <StickyHeader observerTarget={toolbarRef} observerRoot={scrollerRef.current?.osInstance()?.elements().target}>
          <div className="flex h-full w-full items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <Img radius="sm" src={coverImageUrl} className="h-10 w-10" />
              <span className="truncate">{title}</span>
            </div>
            <SongListToolbar isIconOnly songs={songs!} extra={extraTool} />
          </div>
        </StickyHeader>
      </If>
      <div
        className="flex space-x-6 bg-clip-border p-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(${palette?.join(",")},30%) 0 20%, #18181b)`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="h-60 w-60 flex-none">
          <Img
            radius="sm"
            src={`${coverImageUrl}?param=240y240`}
            crossOrigin="anonymous"
            width="100%"
            height="100%"
            onLoad={e => {
              if (e.currentTarget.complete) {
                const color = colorThief.current.getColor(e.currentTarget);
                if (color) {
                  setPalette(color);
                }
              }
            }}
          />
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{title}</span>
            <If condition={Boolean(trackCount)}>
              <span className="text-sm">{trackCount} 首歌曲</span>
            </If>
            <If condition={Boolean(user)}>
              {Array.isArray(user) ? (
                <Breadcrumbs
                  itemClasses={{
                    separator: "px-1",
                  }}
                  maxItems={100}
                  separator="/"
                >
                  {user.map(item => (
                    <BreadcrumbItem key={item?.userId} isCurrent={false} onPress={() => navigate(item?.link as string)}>
                      {item.name}
                    </BreadcrumbItem>
                  ))}
                </Breadcrumbs>
              ) : (
                <User
                  avatarProps={{
                    src: `${user?.avatarUrl}?param=90y90`,
                  }}
                  name={user?.name}
                  className="cursor-pointer hover:text-green-500"
                  onPointerDown={() => user?.link && navigate(user?.link)}
                />
              )}
            </If>
            <Ellipsis showMore={{ title, content: description }}>{description}</Ellipsis>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <If condition={Boolean(songs?.length)}>
          <SongListToolbar
            showSearch
            ref={toolbarRef}
            songs={songs!}
            extra={extraTool}
            onSearch={setSearch}
            className="mb-4"
          />
        </If>
        <VirtualSongList
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

export default VirtualSongListContainer;
