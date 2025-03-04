import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image } from "@heroui/react";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import { getArtistDesc, getArtistDetail } from "@/service";

const Artist = () => {
  const { id } = useParams();

  const { data: artistDetail } = useRequest(() => getArtistDetail({ id }), {
    refreshDeps: [id],
  });

  useEffect(() => {
    getArtistDesc({
      id,
    });
  }, []);

  const isFollewed = artistDetail?.data?.user?.followed;

  const follow = async () => {};

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6">
        <div className="flex-none">
          <Image src={artistDetail?.data?.artist?.avatar} width={232} height={232} radius="full" />
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{artistDetail?.data?.artist?.name}</span>
          </div>
          <AsyncButton onPress={follow} color="default" startContent={isFollewed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}>
            {isFollewed ? "取消关注" : "关注"}
          </AsyncButton>
        </div>
      </div>
    </div>
  );
};

export default Artist;
