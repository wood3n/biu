import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Card, CardBody, CardHeader, Image as Img } from "@heroui/react";
import { RiArrowRightLine } from "@remixicon/react";

import { SongList } from "@/components/song-list";
import VirtualList from "@/components/virtual-list";
import { getAlbum, getArtistAlbum } from "@/service";
import { Album, GetAlbumRes } from "@/service/album";

import Skeleton from "./skeleton";

interface Props {
  getScrollElement: () => HTMLElement | null;
}

const Albums = ({ getScrollElement }: Props) => {
  const { id: artistId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<GetAlbumRes[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);

  const toAlbumDetail = (albumId?: number) => {
    navigate(`/album/${albumId}`);
  };

  const getAlbums = async () => {
    const getArtistAlbumRes = await getArtistAlbum({
      id: artistId,
      limit: 10,
      offset: (pageRef.current - 1) * 10,
    });

    if (getArtistAlbumRes?.hotAlbums?.length) {
      const getAlbumRes = await Promise.allSettled(
        getArtistAlbumRes.hotAlbums.map(album => {
          return getAlbum({
            id: album.id,
          });
        }),
      );

      const pageAlbums = getAlbumRes.map((promise, index) => {
        if (promise.status === "fulfilled" && promise.value.album) {
          return {
            ...promise.value,
            songs: promise.value.songs?.slice(0, 10),
          };
        } else {
          return getArtistAlbumRes.hotAlbums.at(index) as Album;
        }
      });

      setAlbums(old => [...old, ...pageAlbums]);
      setHasMore(getArtistAlbumRes?.more ?? false);
    } else {
      setHasMore(false);
    }
  };

  const reset = () => {
    if (albums.length) {
      pageRef.current = 1;
      setAlbums([]);
      setHasMore(false);
    }
  };

  const init = async () => {
    reset();
    setLoading(true);
    try {
      await getAlbums();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistId) {
      init();
    }
  }, [artistId]);

  const loadMore = async () => {
    pageRef.current = pageRef.current + 1;
    await getAlbums();
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <VirtualList
      maxRowHeight={748}
      dynamicRowHeight
      overscan={2}
      getScrollElement={getScrollElement}
      data={albums}
      hasMore={hasMore}
      loadMore={loadMore}
    >
      {(index, album) => {
        const albumDetail = album?.album;
        const songs = album?.songs;
        const hasMoreSongs = (songs?.length ?? 0) < (albumDetail?.size ?? 0);

        return (
          <div className="w-full py-4">
            <Card className="w-full">
              <CardHeader className="">
                <h1 className="cursor-pointer hover:underline" onPointerDown={() => toAlbumDetail(albumDetail?.id)}>
                  {index + 1}. {albumDetail?.name}
                </h1>
              </CardHeader>
              <CardBody className="flex flex-row space-x-6">
                <div className="flex-none">
                  <Card isHoverable isPressable onPress={() => toAlbumDetail(albumDetail?.id)}>
                    <Img isZoomed src={`${albumDetail?.picUrl}?param=196y196`} width={196} height={196} />
                  </Card>
                </div>
                <SongList
                  hideAlbum
                  songs={songs}
                  className="min-w-0 flex-1"
                  footer={
                    hasMoreSongs && (
                      <div className="pr-4 text-right">
                        <Button
                          size="sm"
                          variant="light"
                          className="opacity-70"
                          endContent={<RiArrowRightLine size={14} />}
                          onPress={() => toAlbumDetail(albumDetail?.id)}
                        >
                          查看更多
                        </Button>
                      </div>
                    )
                  }
                />
              </CardBody>
            </Card>
          </div>
        );
      }}
    </VirtualList>
  );
};

export default Albums;
