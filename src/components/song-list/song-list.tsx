import React from "react";

import { usePlayingQueue } from "@/store/playing-queue";

import { getColumns } from "./columns";
import Row from "./row";
import Skeleton from "./skeleton";

interface Props {
  loading?: boolean;
  songs?: Song[];
  hideAlbum?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const SongList = ({ loading, songs, hideAlbum, footer, className }: Props) => {
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
      <div className="flex flex-col">
        {songs?.map((song, index) => {
          const isSelected = currentSong?.id === song?.id;

          return (
            <Row
              key={song?.id}
              columns={columns}
              hoverable
              isSelected={isSelected}
              render={column => {
                return column.render({
                  rowData: song,
                  index,
                  isSelected,
                });
              }}
              onDoubleClick={() => {
                handlePlay(song);
              }}
            />
          );
        })}
      </div>
      {footer}
    </div>
  );
};
