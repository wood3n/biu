import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, CardBody, CardFooter, Image } from "@heroui/react";

import { getArtistAlbum } from "@/service";
import { HotAlbum } from "@/service/artist-album";

const Albums = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <Card key={item.id} isPressable shadow="sm" onPress={() => navigate(`/album/${item.id}`)}>
          <CardBody className="overflow-visible p-0">
            <Image
              alt={item.name}
              className="w-full object-cover"
              radius="lg"
              shadow="sm"
              src={item.picUrl}
              width="100%"
            />
          </CardBody>
          <CardFooter className="justify-end text-small">
            <b>{item.name}</b>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Albums;
