import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, Input, User } from "@heroui/react";
import { RiPlayCircleLine, RiSearchLine, RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Table from "@/components/table";
import { getPlaylistDetail, getPlaylistSubscribe, getPlaylistTrackAll } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

import { columns } from "./columns";

const Playlist = () => {
  const urlParams = useParams();
  const navigate = useNavigate();
  const user = useUser(store => store.user);
  const [songs, setSongs] = useState<Song[]>();
  const [search, setSearch] = useState("");
  const { currentSong, playList, play } = usePlayingQueue();

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

  const getSongs = async () => {
    const res = await getPlaylistTrackAll({
      id: urlParams?.pid,
      limit: 1000,
      offset: 0,
    });

    if (res?.songs?.length) {
      setSongs(res?.songs);
    }
  };

  useEffect(() => {
    getSongs();
  }, [urlParams.pid]);

  const isOwner = playlistDetail?.playlist?.creator?.userId === user?.profile?.userId;
  const isSubed = playlistDetail?.playlist?.subscribed;

  const playAll = async () => {
    if (Array.isArray(songs) && songs?.length === playlistDetail?.playlist?.trackCount) {
      playList(songs);
    }

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
    <div className="p-4">
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
          {Boolean(songs?.length) && (
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
              <Input className="w-60" placeholder="搜索歌名" onValueChange={setSearch} startContent={<RiSearchLine size={16} />} />
            </div>
          )}
        </div>
      </div>
      <Table
        rowKey="id"
        selectedRowKeys={currentSong ? [currentSong?.id] : undefined}
        columns={columns}
        data={songs?.filter(song => (search?.trim() ? song?.name?.includes(search?.trim()) : true))}
        onDoubleClick={song => play(song, songs)}
      />
    </div>
  );
};

export default Playlist;
