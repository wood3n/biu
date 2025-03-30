import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, Input, User } from "@heroui/react";
import { RiPlayCircleLine, RiSearchLine, RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import VirtuosoSongList from "@/components/song-list";
import { getPlaylistDetail, getPlaylistSubscribe, getPlaylistTrackAll } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

const Playlist = () => {
  const urlParams = useParams();
  const navigate = useNavigate();
  const user = useUser(store => store.user);
  const [search, setSearch] = useState("");
  const { currentSong, playList } = usePlayingQueue();

  const { data: playlistDetail } = useRequest(
    async () => {
      const res = await getPlaylistDetail({
        id: urlParams?.pid,
      });

      return res;
    },
    {
      refreshDeps: [urlParams?.pid],
    },
  );

  const fetchSongs = async (params: { limit: number; offset: number }) => {
    const res = await getPlaylistTrackAll({
      id: urlParams?.pid,
      limit: params.limit,
      offset: params.offset,
    });

    // 如果搜索关键词存在，过滤歌曲列表
    let filteredSongs = res?.songs || [];
    if (search?.trim()) {
      filteredSongs = filteredSongs.filter(song => song?.name?.toLowerCase().includes(search?.trim().toLowerCase()));
    }

    return {
      data: filteredSongs,
      hasMore: params.offset + params.limit < (playlistDetail?.playlist?.trackCount || 0),
    };
  };

  const isOwner = playlistDetail?.playlist?.creator?.userId === user?.profile?.userId;
  const isSubed = playlistDetail?.playlist?.subscribed;

  const playAll = async () => {
    const res = await getPlaylistTrackAll({
      id: urlParams?.pid,
      limit: playlistDetail?.playlist?.trackCount,
      offset: 0,
    });

    if (res?.songs?.length) {
      playList(res.songs);
    }
  };

  const subscribe = async () => {
    await getPlaylistSubscribe({
      id: urlParams?.pid,
      t: isSubed ? 2 : 1,
    });
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex space-x-6">
        <div className="flex-none">
          <Image src={playlistDetail?.playlist?.coverImgUrl} width={232} height={232} radius="sm" />
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{playlistDetail?.playlist?.name}</span>
            <span className="text-base text-zinc-500">{playlistDetail?.playlist?.trackCount} 首歌曲</span>
            <User
              avatarProps={{
                src: playlistDetail?.playlist?.creator?.avatarUrl,
              }}
              name={playlistDetail?.playlist?.creator?.nickname}
              className="cursor-pointer hover:text-green-500"
              onPointerDown={() => navigate(`/profile/${playlistDetail?.playlist?.creator?.userId}`)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={playAll}>
                播放
              </AsyncButton>
              {!isOwner && (
                <AsyncButton onPress={subscribe} color="default" startContent={isSubed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}>
                  {isSubed ? "取消收藏" : "收藏"}
                </AsyncButton>
              )}
            </div>
            <Input className="w-60" placeholder="搜索歌名" value={search} onValueChange={setSearch} startContent={<RiSearchLine size={16} />} />
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <VirtuosoSongList service={fetchSongs} defaultLimit={50} hideAlbum={false} className="h-full" />
      </div>
    </div>
  );
};

export default Playlist;
