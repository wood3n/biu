import React, { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import { useOverlayScrollbars } from "overlayscrollbars-react";
import { Spinner } from "@heroui/react";

import { usePlayingQueue } from "@/store/playing-queue";

import Empty from "../empty";
import Header from "./header";
import Row from "./row";

interface Props {
  loading: boolean;
  songs?: Song[];
  header?: React.ReactNode;
  hideAlbum?: boolean;
  className?: string;
}

const rowHeight = 60;

const SongList = ({ loading, songs, hideAlbum, header, className }: Props) => {
  const [search, setSearch] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  const { currentSong, play, playList } = usePlayingQueue();

  const [initialize, osInstance] = useOverlayScrollbars({ options: { scrollbars: { autoHide: "leave", theme: "os-theme-light" } }, defer: true });

  useEffect(() => {
    if (scroller && containerRef.current) {
      initialize({
        target: containerRef.current,
        elements: {
          viewport: scroller,
        },
      });
    }

    return () => osInstance()?.destroy();
  }, [scroller, initialize, osInstance]);

  const handlePlayAll = () => {
    playList(songs!);
  };

  const renderHeader = () => {
    return <Header showToolbar={Boolean(songs?.length)} hideAlbum={hideAlbum} header={header} onSearch={setSearch} onPlayAll={handlePlayAll} />;
  };

  const renderRow = (index: number) => {
    const song = songs?.[index];

    return <Row index={index} data={song!} hideAlbum={hideAlbum} list={songs} rowHeight={60} />;
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Virtuoso
        data={filteredSongs}
        totalCount={filteredSongs?.length}
        fixedItemHeight={rowHeight}
        overscan={{ main: 5, reverse: 5 }}
        itemContent={renderRow}
        scrollerRef={v => setScroller(v as HTMLElement)}
        components={{
          Header: renderHeader,
          EmptyPlaceholder: Empty,
        }}
        className="relative overflow-hidden"
      />
    </div>
  );
};

export default SongList;
