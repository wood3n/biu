import React from "react";

import { usePlayingQueue } from "@/store/playing-queue";

import VirtualList from "../virtual-list";
import { getColumns } from "./columns";
import Row from "./row";
import Skeleton from "./skeleton";

interface Props {
  loading?: boolean;
  songs?: Song[];
  hideAlbum?: boolean;
  getScrollElement: () => HTMLElement | null;
  virtualScrollMargin?: number;
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
  className?: string;
}

export const VirtualSongList = ({
  loading,
  getScrollElement,
  virtualScrollMargin,
  songs,
  hideAlbum,
  hasMore,
  loadMore,
  className,
}: Props) => {
  const { currentSong, play } = usePlayingQueue();

  if (loading) {
    return <Skeleton hideAlbum={hideAlbum} />;
  }

  const handlePlay = (song: Song) => {
    play(song, songs);
  };

  const columns = getColumns({ hideAlbum }).filter(item => !item.hidden);

  return (
    <div className={className}>
      <Row columns={columns} render={column => column.title} className="mb-1 bg-zinc-800 text-sm text-zinc-400" />
      <VirtualList
        maxRowHeight={60}
        data={songs}
        getScrollElement={getScrollElement}
        scrollMargin={virtualScrollMargin}
        hasMore={hasMore}
        loadMore={loadMore}
      >
        {(index, song) => {
          const isSelected = currentSong?.id === song?.id;

          return (
            <Row
              key={song?.id}
              columns={columns}
              hoverable
              isSelected={isSelected}
              render={(column, isHovered) => {
                return column.render({
                  rowData: song,
                  index,
                  isSelected,
                  isHovered,
                });
              }}
              onDoubleClick={() => {
                handlePlay(song);
              }}
            />
          );
        }}
      </VirtualList>
    </div>
  );
};
