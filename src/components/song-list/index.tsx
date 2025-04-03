import React, { useMemo, useRef, useState } from "react";

import { Spinner } from "@heroui/react";

import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import ScrollContainer, { type ScrollRefObject } from "../scroll-container";
import { getColumns } from "./columns";
import Header from "./header";
import Row from "./row";
import VirtualList from "./virtual-list";

interface Props {
  loading: boolean;
  songs?: Song[];
  header?: React.ReactNode;
  hideAlbum?: boolean;
  className?: string;
}

const SongList = ({ loading, songs, header, hideAlbum }: Props) => {
  const [search, setSearch] = useState<string>();

  const isVirtual = (songs?.length ?? 0) > 100;

  const columns = getColumns({ hideAlbum });

  const scrollerRef = useRef<ScrollRefObject>(null);

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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full p-6">
      <Header header={header} showToolbar={Boolean(songs?.length)} columns={columns} onSearch={setSearch} onPlayAll={handlePlayAll} />
      <If condition={isVirtual}>
        <VirtualList data={songs} getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement}>
          {(index, data) => {
            return <Row key={data?.id} index={index} data={data} columns={columns} hoverable isSelected={currentSong?.id === data?.id} />;
          }}
        </VirtualList>
      </If>
      <If condition={!isVirtual}>
        <div className="flex flex-col">
          {filteredSongs?.map((song, index) => (
            <Row key={song?.id} index={index} data={song} columns={columns} hoverable isSelected={currentSong?.id === song?.id} />
          ))}
        </div>
      </If>
    </ScrollContainer>
  );
};

export default SongList;
