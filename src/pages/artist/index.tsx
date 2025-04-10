import React, { useRef } from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, Tab, Tabs } from "@heroui/react";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import If from "@/components/if";
import ScrollContainer, { ScrollRefObject } from "@/components/scroll-container";
import { getArtistDesc, getArtists, getArtistSub } from "@/service";

import Albums from "./albums";
import Hits from "./hits";

const Artist = () => {
  const { id } = useParams();
  const scrollerRef = useRef<ScrollRefObject>(null);

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
    <ScrollContainer ref={scrollerRef} className="p-6">
      <div className="mb-6 flex space-x-6">
        <div className="h-60 w-60 flex-none">
          <Image isBlurred src={artistDetail?.artist?.img1v1Url} width="100%" height="100%" radius="full" />
        </div>
        <div className="flex flex-grow flex-col items-start justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{artistDetail?.artist?.name}</span>
            <If condition={Boolean(artistDetail?.artist?.albumSize)}>
              <span className="text-sm">{artistDetail?.artist?.albumSize} 张专辑</span>
            </If>
            <Ellipsis
              lines={2}
              showMore={{
                title: artistDetail?.artist?.name,
                content: (
                  <div className="space-y-4">
                    <div>{artistDesc?.briefDesc}</div>
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
              {artistDesc?.introduction?.reduce((acc, intro) => {
                return `${acc}${intro.txt}`;
              }, artistDesc?.briefDesc)}
            </Ellipsis>
          </div>
          <AsyncButton
            onPress={collect}
            color="default"
            startContent={isFavorite ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
          >
            {isFavorite ? "取消关注" : "关注"}
          </AsyncButton>
        </div>
      </div>
      <Tabs aria-label="歌手热门歌曲和专辑">
        <Tab key="songs" title="热门歌曲">
          <Hits />
        </Tab>
        {Boolean(artistDetail?.artist?.albumSize) && (
          <Tab key="album" title="专辑">
            <Albums getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement} />
          </Tab>
        )}
      </Tabs>
    </ScrollContainer>
  );
};

export default Artist;
