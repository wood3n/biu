import React from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, Tab, Tabs } from "@heroui/react";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import { getArtistDesc, getArtists, getArtistSub } from "@/service";

import Albums from "./albums";
import HotSongs from "./hot-songs";

const Artist = () => {
  const { id } = useParams();

  const { data: artistDetail } = useRequest(
    () =>
      getArtists({
        id,
      }),
    {
      refreshDeps: [id],
    },
  );

  const { data: artistDesc } = useRequest(() => getArtistDesc({ id }), {
    refreshDeps: [id],
  });

  const isFavorite = artistDetail?.artist?.followed;

  // 收藏
  const collect = async () => {
    await getArtistSub({
      id,
      t: isFavorite ? 2 : 1,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6">
        <div className="flex-none">
          <Image src={artistDetail?.artist?.img1v1Url} width={232} height={232} radius="full" />
        </div>
        <div className="flex flex-grow flex-col items-start justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{artistDetail?.artist?.name}</span>
            <Ellipsis
              lines={2}
              showMore={{
                title: artistDetail?.artist?.name,
                content: (
                  <div className="space-y-4">
                    <h1 className="mb-4">简介</h1>
                    {artistDesc?.briefDesc}
                    {artistDesc?.introduction?.map((intro, i) => (
                      <div key={String(i)}>
                        <h1 className="mb-4">{intro.ti}</h1>
                        <div>{intro.txt}</div>
                      </div>
                    ))}
                  </div>
                ),
              }}
            >
              {artistDesc?.briefDesc}
            </Ellipsis>
          </div>
          <AsyncButton onPress={collect} color="default" startContent={isFavorite ? <RiStarFill size={16} /> : <RiStarLine size={16} />}>
            {isFavorite ? "取消收藏" : "收藏"}
          </AsyncButton>
        </div>
      </div>
      <Tabs aria-label="歌手热门歌曲和专辑">
        <Tab key="photos" title="热门歌曲">
          <HotSongs />
        </Tab>
        <Tab key="music" title="专辑">
          <Albums />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Artist;
