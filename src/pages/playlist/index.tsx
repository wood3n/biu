import React from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import If from "@/components/if";
import SongList from "@/components/song-list";
import { getPlaylistDetail, getPlaylistSubscribe, getPlaylistTrackAll } from "@/service";
import { useUser } from "@/store/user";

const Playlist = () => {
  const urlParams = useParams();
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
      coverImageUrl={data?.playlistDetail?.playlist?.coverImgUrl}
      title={data?.playlistDetail?.playlist?.name}
      description={data?.playlistDetail?.playlist?.description}
      owner={{
        avatarUrl: data?.playlistDetail?.playlist?.creator?.avatarUrl,
        name: data?.playlistDetail?.playlist?.creator?.nickname,
        userId: data?.playlistDetail?.playlist?.creator?.userId,
      }}
      extraTool={
        <If condition={!isOwner}>
          <AsyncButton
            onPress={subscribe}
            color="default"
            isIconOnly
            startContent={isSubscribed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
          />
        </If>
      }
      hideAlbum={false}
      className="h-full w-full"
    />
  );
};

export default Playlist;
