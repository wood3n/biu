import React, { useCallback, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import clx from "classnames";
import { Button, Spinner } from "@heroui/react";
import { RiPlayCircleLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

import { getColumns } from "./columns";

interface LoadMoreService {
  data: Song[];
  hasMore?: boolean;
}

interface Props {
  service: (params: { limit: number; offset: number }) => Promise<LoadMoreService>;
  defaultLimit?: number;
  hideAlbum?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const VirtuosoSongList = ({ service, defaultLimit = 20, hideAlbum = true, className, style, title }: Props) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const { currentSong, play, playList } = usePlayingQueue();

  const columns = getColumns({ hideAlbum }).filter(column => column.key !== "operations");

  const gridTemplateColumns = React.useMemo(() => {
    return columns
      .map((column, index) => {
        if (column.hidden) return "";

        // 如果是第一列(索引列)，设置较小的固定宽度
        if (index === 0) {
          return "40px";
        }

        const minWidth = typeof column.minWidth === "string" ? column.minWidth : `${column.minWidth || 100}px`;
        const fraction = column.columnFraction || 1;
        return `minmax(${minWidth}, ${fraction}fr)`;
      })
      .filter(Boolean)
      .join(" ");
  }, [columns]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await service({
        limit: defaultLimit,
        offset: offset,
      });

      if (res?.data?.length) {
        setSongs(prev => [...prev, ...res.data]);
        setOffset(prev => prev + res.data.length);
        setHasMore(Boolean(res.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load songs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [service, defaultLimit, offset, loading, loadingMore, hasMore]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service({
        limit: defaultLimit,
        offset: 0,
      });

      if (res?.data?.length) {
        setSongs(res.data);
        setOffset(res.data.length);
        setHasMore(Boolean(res.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load initial songs:", error);
    } finally {
      setLoading(false);
    }
  }, [service, defaultLimit]);

  React.useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playList(songs);
    }
  };

  const renderHeader = () => {
    return (
      <>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button color="success" size="sm" startContent={<RiPlayCircleLine size={16} />} onPress={handlePlayAll} disabled={songs.length === 0}>
              播放全部
            </Button>
          </div>
        )}
        <div
          className={`sticky top-0 z-50 mb-1 grid gap-2 rounded-lg bg-zinc-800 text-sm text-zinc-400`}
          style={{
            gridTemplateColumns,
          }}
        >
          {columns
            .filter(column => !column.hidden)
            .map(column => (
              <div key={column.key} className={clx(column.className, "flex", `justify-${column.align ?? "start"}`, "items-center", "p-2")}>
                {column.title}
              </div>
            ))}
        </div>
      </>
    );
  };

  const renderSongRow = (index: number) => {
    const song = songs[index];
    const isSelected = currentSong?.id === song.id;

    return (
      <div
        className={clx(`grid cursor-pointer gap-2 rounded-lg transition`, {
          "bg-mid-green text-green-500": isSelected,
          "hover:bg-zinc-800": !isSelected,
        })}
        onDoubleClick={() => play(song, songs)}
        style={{
          gridTemplateColumns,
        }}
      >
        {columns
          .filter(column => !column.hidden)
          .map(column => (
            <div key={column.key} className={clx(column.className, "flex", `justify-${column.align ?? "start"}`, "items-center", "p-2")}>
              {column.render
                ? column.render({
                    value: song[column.key],
                    index,
                    rowData: song,
                    isSelected,
                  })
                : song[column.key]}
            </div>
          ))}
      </div>
    );
  };

  const renderFooter = () => {
    return hasMore ? (
      <div className="flex justify-center py-4">
        {loadingMore ? (
          <Spinner size="sm" color="success" />
        ) : (
          <Button size="sm" variant="ghost" onPress={loadMore}>
            加载更多
          </Button>
        )}
      </div>
    ) : songs.length > 0 ? (
      <div className="py-4 text-center text-sm text-zinc-500">没有更多歌曲了</div>
    ) : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Virtuoso
        data={songs}
        totalCount={songs.length}
        overscan={200}
        itemContent={renderSongRow}
        components={{
          Header: renderHeader,
          Footer: renderFooter,
        }}
        endReached={loadMore}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default VirtuosoSongList;
