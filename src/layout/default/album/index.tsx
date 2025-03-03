import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AutoSizer, InfiniteLoader, List as VirtualList } from "react-virtualized";

import classNames from "classnames";
import { useOverlayScrollbars } from "overlayscrollbars-react";
import { Button, Image } from "@heroui/react";
import { RiPlayCircleLine } from "@remixicon/react";

import { getAlbumSublist } from "@/service";
import { AlbumSublistData } from "@/service/album-sublist";

import "react-virtualized/styles.css";

const Album = () => {
  const [data, setData] = useState<AlbumSublistData[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const urlParams = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [initialize] = useOverlayScrollbars({ defer: true, options: { scrollbars: { autoHide: "leave", theme: "os-theme-light" } } });

  useEffect(() => {
    if (containerRef.current) {
      initialize({
        target: containerRef.current,
        elements: {
          viewport: containerRef.current.firstElementChild as HTMLElement,
        },
      });
    }
  }, [initialize]);

  const getPageData = async (pageIndex: number) => {
    const res = await getAlbumSublist({
      limit: 10,
      offset: (pageIndex - 1) * 10,
    });

    if (res?.count && res?.data) {
      setCount(res.count);
      setData([...data, ...res.data]);
      setHasMore(res.hasMore as boolean);
    }
  };

  // useEffect(() => {
  //   getPageData(page);
  // }, [page]);

  const rowRenderer = ({ index, key, style }) => {
    const album = data[index];
    const isSelected = album?.id === urlParams?.id;

    return (
      <div
        key={key}
        className={classNames("flex cursor-pointer items-center space-x-2 rounded-lg p-2", {
          "hover:bg-zinc-800": !isSelected,
          "bg-mid-green text-green-500": isSelected,
        })}
        onPointerDown={() => navigate(`/album/${album?.id}`)}
        style={style}
      >
        <span className="flex-none">
          <Image radius="sm" src={album?.picUrl} width={40} height={40} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col space-y-1">
          <span className="truncate text-sm">{album?.name}</span>
          <span className="text-xs text-zinc-500">{album?.size}首</span>
        </div>
        <div className="flex items-center">
          <Button color="success" isIconOnly size="sm" variant="light">
            <RiPlayCircleLine />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <InfiniteLoader
        loadMoreRows={({ startIndex, stopIndex }) => {
          if (hasMore) {
            return getPageData(page + 1);
          }

          return Promise.resolve();
        }}
        isRowLoaded={() => false}
        rowCount={count}
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer>
            {({ height, width }) => (
              <div data-overlayscrollbars-initialize="" ref={containerRef}>
                <VirtualList
                  width={width}
                  height={height}
                  rowHeight={56}
                  rowCount={count}
                  onRowsRendered={onRowsRendered}
                  outerRef={listRef}
                  ref={registerChild}
                  rowRenderer={rowRenderer}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default Album;
