import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useInViewport } from "ahooks";
import ColorThief from "colorthief";
import { Image as Img, Spinner, User } from "@heroui/react";

import { usePlayingQueue } from "@/store/playing-queue";

import Ellipsis from "../ellipsis";
import If from "../if";
import ScrollContainer, { type ScrollRefObject } from "../scroll-container";
import { getColumns } from "./columns";
import Row from "./row";
import RowHeader from "./row-header";
import StickyHeader from "./sticky-header";
import Toolbar from "./toolbar";
import VirtualList from "./virtual-list";

interface Owner {
  userId?: number;
  name?: string;
  avatarUrl?: string;
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
  className?: string;
}

const SongList = ({ loading, coverImageUrl, title, description, owner, songs, extraTool, hideAlbum }: Props) => {
  const [search, setSearch] = useState<string>();
  const [palette, setPalette] = useState<[number, number, number] | null>(null);

  const scrollerRef = useRef<ScrollRefObject>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const colorThief = useRef(new ColorThief());

  const navigate = useNavigate();

  const [toolbarVisible] = useInViewport(toolbarRef, {
    root: scrollerRef.current?.osInstance()?.elements().target as HTMLDivElement,
  });

  const { currentSong, play, playList } = usePlayingQueue();

  const filteredSongs = useMemo(() => {
    if (!search?.trim()) {
      return songs;
    }

    const searchContent = search.trim().toLocaleLowerCase();

    return songs?.filter(
      song =>
        song.name.toLowerCase().includes(searchContent) ||
        song.ar?.some(ar => ar.name.toLowerCase().includes(searchContent)) ||
        song.al?.name?.toLowerCase().includes(searchContent),
    );
  }, [songs, search]);

  const handlePlayAll = () => {
    playList(songs!);
  };

  const download = () => {
    console.log("download");
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isVirtual = (songs?.length ?? 0) > 100;
  const columns = getColumns({ hideAlbum });

  return (
    <ScrollContainer
      ref={scrollerRef}
      className="h-full w-full"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(${palette?.join(",")},20%) 0 10%, #18181b 40% 100%)`,
        backgroundRepeat: "no-repeat",
      }}
    >
      <StickyHeader
        visible={!toolbarVisible}
        coverImageUrl={coverImageUrl}
        title={title}
        extraTool={extraTool}
        onPlayAll={handlePlayAll}
        onDownload={download}
        style={{
          backgroundImage: `linear-gradient(to right, rgba(${palette?.join(",")},40%), #18181b)`,
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="p-6">
        <div className="mb-4 flex space-x-6">
          <div className="flex-none">
            <Img
              src={coverImageUrl}
              crossOrigin="anonymous"
              width={232}
              height={232}
              onLoad={e => {
                if (e.currentTarget.complete) {
                  const color = colorThief.current.getColor(e.currentTarget);
                  setPalette(color);
                }
              }}
            />
          </div>
          <div className="flex flex-grow flex-col justify-between">
            <div className="flex flex-col items-start space-y-4">
              <span className="text-4xl font-bold">{title}</span>
              <If condition={Boolean(songs?.length)}>
                <span className="text-base mix-blend-darken">{songs?.length} 首歌曲</span>
              </If>
              <If condition={Boolean(owner)}>
                <User
                  avatarProps={{
                    src: owner?.avatarUrl,
                  }}
                  name={owner?.name}
                  className="cursor-pointer hover:text-green-500"
                  onPointerDown={() => navigate(`/profile/${owner?.userId}`)}
                />
              </If>
              <Ellipsis>{description}</Ellipsis>
            </div>
          </div>
        </div>
        <If condition={Boolean(songs?.length)}>
          <Toolbar
            ref={toolbarRef}
            extraTool={extraTool}
            onPlayAll={handlePlayAll}
            onSearch={setSearch}
            onDownload={download}
          />
        </If>
        <RowHeader columns={columns} />
        <If condition={isVirtual}>
          <VirtualList
            data={filteredSongs}
            getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement}
          >
            {(index, data) => {
              return (
                <Row
                  key={data?.id}
                  index={index}
                  data={data}
                  columns={columns}
                  hoverable
                  isSelected={currentSong?.id === data?.id}
                />
              );
            }}
          </VirtualList>
        </If>
        <If condition={!isVirtual}>
          <div className="flex flex-col">
            {filteredSongs?.map((song, index) => (
              <Row
                key={song?.id}
                index={index}
                data={song}
                columns={columns}
                hoverable
                isSelected={currentSong?.id === song?.id}
              />
            ))}
          </div>
        </If>
      </div>
    </ScrollContainer>
  );
};

export default SongList;
