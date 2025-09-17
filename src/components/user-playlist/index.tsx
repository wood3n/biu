import React, { useState } from "react";
import { useNavigate } from "react-router";

import { Card, CardBody, CardHeader, Image as Img, Pagination } from "@heroui/react";

import If from "@/components/if";
import { PlaylistInfoType } from "@/service/user-playlist";

interface Props {
  data?: PlaylistInfoType[];
}

const UserPlayList = ({ data }: Props) => {
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5">
        {data?.slice((page - 1) * 30, page * 30).map(item => (
          <Card isHoverable isPressable key={item.id} onPress={() => navigate(`/playlist/${item.id}`)}>
            <CardHeader className="flex-col items-start px-4">
              <p className="max-w-full truncate text-xl">{item.name}</p>
              <If condition={Boolean(item?.trackCount)}>
                <small className="text-default-500">{item?.trackCount} 首歌曲</small>
              </If>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <Img alt={item.name} className="rounded-xl object-cover" src={item.coverImgUrl} width="100%" />
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="sticky -bottom-4 z-10 mt-4 flex justify-center">
        <div className="rounded-lg bg-transparent p-4 backdrop-blur">
          <Pagination
            color="success"
            showControls
            disableAnimation
            initialPage={1}
            page={page}
            total={Math.ceil((data?.length ?? 0) / 30)}
            onChange={setPage}
          />
        </div>
      </div>
    </>
  );
};

export default UserPlayList;
