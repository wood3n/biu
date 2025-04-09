import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import If from "@/components/if";
import VirtualListContainer from "@/components/virtual-list-container";
import { getPlaylistDetail, getPlaylistSubscribe, getPlaylistTrackAll } from "@/service";
import { Playlist as PlaylistType } from "@/service/playlist-detail";
import { SubscribeState } from "@/service/playlist-subscribe";
import { useUser } from "@/store/user";

const Playlist = () => {
  const urlParams = useParams();
  const user = useUser(store => store.user);
  const [loading, setLoading] = useState(false);
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistType>();
  const [songs, setSongs] = useState<Song[]>([]);
  const pageRef = useRef(1);

  const getSongs = async () => {
    const limit = 500;
    const trackRes = await getPlaylistTrackAll({
      id: urlParams?.pid,
      limit,
      offset: (pageRef.current - 1) * limit,
    });

    if (trackRes?.songs?.length) {
      setSongs(prev => [...prev, ...trackRes.songs!]);
    }
  };

  const init = async () => {
    setLoading(true);
    try {
      const getPlaylistDetailRes = await getPlaylistDetail({
        id: urlParams?.pid,
      });

      setPlaylistDetail(getPlaylistDetailRes?.playlist);

      if (getPlaylistDetailRes?.playlist?.trackCount) {
        await getSongs();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlParams?.pid) {
      setSongs([]);
      pageRef.current = 1;
      init();
    }
  }, [urlParams?.pid]);

  const loadMore = async () => {
    pageRef.current = pageRef.current + 1;
    await getSongs();
  };

  const isOwner = playlistDetail?.creator?.userId === user?.profile?.userId;
  const isSubscribed = playlistDetail?.subscribed;

  const subscribe = async () => {
    await getPlaylistSubscribe({
      id: urlParams?.pid,
      t: isSubscribed ? SubscribeState.Unsubscribed : SubscribeState.Subscribed,
    });
  };

  return (
    <VirtualListContainer
      loading={loading}
      songs={songs}
      trackCount={playlistDetail?.trackCount}
      hasMore={songs.length < (playlistDetail?.trackCount ?? 0)}
      loadMore={loadMore}
      coverImageUrl={playlistDetail?.coverImgUrl}
      title={playlistDetail?.name}
      description={playlistDetail?.description}
      user={{
        avatarUrl: playlistDetail?.creator?.avatarUrl,
        name: playlistDetail?.creator?.nickname,
        userId: playlistDetail?.creator?.userId,
        link: `/profile/${playlistDetail?.creator?.userId}`,
      }}
      extraTool={
        <If condition={!isOwner}>
          <AsyncButton
            onPress={subscribe}
            color="default"
            isIconOnly
            startContent={isSubscribed ? <RiStarFill size={20} /> : <RiStarLine size={20} />}
          />
        </If>
      }
    />
  );
};

export default Playlist;
