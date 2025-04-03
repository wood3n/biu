import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, User } from "@heroui/react";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import SongList from "@/components/song-list";
import { getPlaylistDetail, getPlaylistSubscribe, getPlaylistTrackAll } from "@/service";
import { useUser } from "@/store/user";

const Playlist = () => {
  const urlParams = useParams();
  const navigate = useNavigate();
  const user = useUser(store => store.user);

  const { loading, data } = useRequest(
    async () => {
      const playlistDetail = await getPlaylistDetail({
        id: urlParams?.pid,
      });

      if (playlistDetail?.playlist?.trackCount) {
        const trackRes = await getPlaylistTrackAll({
          id: urlParams?.pid,
          limit: playlistDetail.playlist.trackCount,
          offset: 0,
        });

        return {
          playlistDetail,
          songs: trackRes?.songs,
          total: playlistDetail.playlist.trackCount,
        };
      }

      return {
        playlistDetail,
      };
    },
    {
      refreshDeps: [urlParams?.pid],
    },
  );

  const isOwner = data?.playlistDetail?.playlist?.creator?.userId === user?.profile?.userId;
  const isSubscribed = data?.playlistDetail?.playlist?.subscribed;

  const subscribe = async () => {
    await getPlaylistSubscribe({
      id: urlParams?.pid,
      t: isSubscribed ? 2 : 1,
    });
  };

  return (
    <SongList
      loading={loading}
      songs={data?.songs}
      header={
        <div className="mb-6 flex space-x-6">
          <div className="flex-none">
            <Image src={data?.playlistDetail?.playlist?.coverImgUrl} width={232} height={232} radius="sm" />
          </div>
          <div className="flex flex-grow flex-col justify-between">
            <div className="flex flex-col items-start space-y-4">
              <span className="text-4xl font-bold">{data?.playlistDetail?.playlist?.name}</span>
              <span className="text-base text-zinc-500">{data?.playlistDetail?.playlist?.trackCount} 首歌曲</span>
              <User
                avatarProps={{
                  src: data?.playlistDetail?.playlist?.creator?.avatarUrl,
                }}
                name={data?.playlistDetail?.playlist?.creator?.nickname}
                className="cursor-pointer hover:text-green-500"
                onPointerDown={() => navigate(`/profile/${data?.playlistDetail?.playlist?.creator?.userId}`)}
              />
            </div>
            <div className="flex items-center space-x-4">
              {!isOwner && (
                <AsyncButton
                  onPress={subscribe}
                  color="default"
                  startContent={isSubscribed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
                >
                  {isSubscribed ? "取消收藏" : "收藏"}
                </AsyncButton>
              )}
            </div>
          </div>
        </div>
      }
      hideAlbum={false}
      className="h-full w-full"
    />
  );
};

export default Playlist;
