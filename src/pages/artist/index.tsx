import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import clx from "classnames";
import { Chip, Image, Tab, Tabs, Tooltip } from "@heroui/react";
import {
  RiAlbumLine,
  RiMenLine,
  RiMusic2Line,
  RiPlayListLine,
  RiStarFill,
  RiStarLine,
  RiWomenLine,
} from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import If from "@/components/if";
import ScrollContainer, { ScrollRefObject } from "@/components/scroll-container";
import { SongList } from "@/components/song-list";
import SongListToolbar from "@/components/song-list-toolbar";
import UserPlayList from "@/components/user-playlist";
import {
  getArtistDesc,
  getArtistDetail,
  getArtistSub,
  getArtistTopSong,
  getUserDetail,
  getUserPlaylist,
} from "@/service";
import { ArtistSubState } from "@/service/artist-sub";

import Albums from "./albums";

const Artist = () => {
  const { id: artistId } = useParams();
  const scrollerRef = useRef<ScrollRefObject>(null);
  const [tab, setTab] = useState<string>("hits");

  const { data: artistDetail } = useRequest(
    async () => {
      const res = await getArtistDetail({
        id: artistId,
      });

      return res?.data;
    },
    {
      refreshDeps: [artistId],
    },
  );

  const { data: artistDesc } = useRequest(() => getArtistDesc({ id: artistId }), {
    refreshDeps: [artistId],
  });

  const { data: userDetail } = useRequest(
    () =>
      getUserDetail({
        uid: artistDetail?.user?.userId,
      }),
    {
      ready: Boolean(artistDetail?.user?.userId),
      refreshDeps: [artistDetail?.user?.userId],
    },
  );

  const { data: hits, loading: loadingHits } = useRequest(() => getArtistTopSong({ id: artistId }), {
    refreshDeps: [artistId],
  });

  const { data: playlist } = useRequest(
    async () => {
      const res = await getUserPlaylist({
        uid: artistDetail?.user?.userId,
        limit: userDetail?.profile?.playlistCount,
        offset: 0,
      });

      return res?.playlist;
    },
    {
      ready: Boolean(artistDetail?.user?.userId) && Boolean(userDetail?.profile?.playlistCount),
      refreshDeps: [artistDetail?.user?.userId],
    },
  );

  const isFavorite = artistDetail?.user?.followed;

  // 收藏
  const collect = async () => {
    await getArtistSub({
      id: artistId,
      t: isFavorite ? ArtistSubState.Unsub : ArtistSubState.Sub,
    });
  };

  const tabs = [
    {
      key: "hits",
      icon: <RiMusic2Line size={18} />,
      title: "热门歌曲",
      count: hits?.songs?.length,
      content: <SongList loading={loadingHits} songs={hits?.songs} />,
      extra: Boolean(hits?.songs?.length) && <SongListToolbar songs={hits!.songs} />,
    },
    {
      key: "albums",
      icon: <RiAlbumLine size={18} />,
      title: "专辑",
      count: artistDetail?.artist?.albumSize,
      hidden: !artistDetail?.artist?.albumSize,
      content: (
        <Albums getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement} />
      ),
    },
    {
      key: "playlists",
      icon: <RiPlayListLine size={18} />,
      title: "歌单",
      count: playlist?.length,
      hidden: !playlist?.length,
      content: <UserPlayList data={playlist} />,
    },
  ];

  return (
    <ScrollContainer ref={scrollerRef} className="p-6">
      <div className="mb-6 flex space-x-6">
        <div className="h-60 w-60 flex-none">
          <Image
            isBlurred
            src={artistDetail?.user?.avatarUrl}
            width="100%"
            height="100%"
            radius="full"
            classNames={{
              wrapper: "h-full w-full",
            }}
          />
        </div>
        <div className="flex flex-grow flex-col items-start justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{artistDetail?.artist?.name}</span>
            <div className="flex items-center space-x-2">
              <If condition={userDetail?.profile?.gender}>
                <Chip
                  size="sm"
                  className={clx({
                    "bg-blue-500": userDetail?.profile?.gender === 1,
                    "bg-pink-500": userDetail?.profile?.gender === 2,
                  })}
                >
                  {userDetail?.profile?.gender === 1 ? <RiMenLine size={14} /> : <RiWomenLine size={14} />}
                </Chip>
              </If>
              <Chip size="sm">LV {userDetail?.level}</Chip>
              <Tooltip content={isFavorite ? "取消关注" : "关注"}>
                <AsyncButton isIconOnly variant="light" size="sm" onPress={collect} color="default">
                  {isFavorite ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
                </AsyncButton>
              </Tooltip>
            </div>
            <If condition={userDetail?.profile?.signature}>
              <Ellipsis
                lines={2}
                showMore={{
                  title: "简介",
                  content: userDetail?.profile?.signature,
                }}
              >
                简介：{userDetail?.profile?.signature}
              </Ellipsis>
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
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        {/* @ts-ignore */}
        <Tabs aria-label="热门歌曲、专辑以及歌单" size="lg" selectedKey={tab} onSelectionChange={setTab}>
          {tabs
            .filter(item => !item.hidden)
            .map(item => (
              <Tab
                key={item.key}
                title={
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.title}</span>
                    {Boolean(item.count) && (
                      <Chip size="sm" variant="faded">
                        {item.count}
                      </Chip>
                    )}
                  </div>
                }
              />
            ))}
        </Tabs>
        {tabs.find(item => item.key === tab)?.extra}
      </div>
      {tabs.find(item => item.key === tab)?.content}
    </ScrollContainer>
  );
};

export default Artist;
