import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Card, CardFooter, Image } from "@heroui/react";

import { getArtistAlbum } from "@/service";
import { HotAlbum } from "@/service/artist-album";

const Albums = () => {
  const { id } = useParams();

  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<HotAlbum[]>([]);
  const [more, setMore] = React.useState(false);

  const getData = async () => {
    const res = await getArtistAlbum({
      id,
      limit: 10,
      offset: (page - 1) * 10,
    });

    if (res?.code === 200 && res?.hotAlbums?.length) {
      setData(old => [...old, ...res.hotAlbums]);
      setMore(res?.more);
    }
  };

  useEffect(() => {
    getData();
  }, [page]);

  return (
    <div className="grid grid-cols-4 gap-8">
      {data?.map(item => (
        <Card key={item.id} isHoverable isFooterBlurred className="cursor-pointer border-none" radius="lg">
          <Image alt="Woman listing to music" className="object-cover" src={item.picUrl} width="100%" />
          <CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
            <p className="text-tiny text-white/80">{item.name}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Albums;
