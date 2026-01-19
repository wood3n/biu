import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import { addToast } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { postFavSeasonFav } from "@/service/fav-season-fav";
import { postFavSeasonUnfav } from "@/service/fav-season-unfav";
import { getUserVideoArchivesList, type Media } from "@/service/user-video-archives-list";
import { useFavoritesStore } from "@/store/favorite";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Header from "../header";
import Operations from "../operation";
import SeriesGridList from "./grid-list";
import SeriesList from "./list";

/** 视频合集 */
const VideoCollections = () => {
  const { id } = useParams();
  const user = useUser(state => state.user);
  const collectedFavorites = useFavoritesStore(state => state.collectedFavorites);
  const addCollectedFavorite = useFavoritesStore(state => state.addCollectedFavorite);
  const rmCollectedFavorite = useFavoritesStore(state => state.rmCollectedFavorite);
  const displayMode = useSettings(state => state.displayMode);
  const playList = usePlayList(state => state.playList);
  const addList = usePlayList(state => state.addList);
  const isFavorite = collectedFavorites?.some(item => item.id === Number(id));

  const [keyword, setKeyword] = useState<string>();
  const [order, setOrder] = useState("pubtime");

  const scrollRef = useRef<ScrollRefObject>(null);

  const { data, loading } = useRequest(
    async () => {
      if (!id) {
        return;
      }

      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });
      return res?.data;
    },
    {
      refreshDeps: [id],
    },
  );

  useEffect(() => {
    if (id) {
      setKeyword("");
      setOrder("pubtime");
    }
  }, [id]);

  // 过滤和排序媒体数据
  const filteredMedias = useMemo(() => {
    const medias = data?.medias ?? [];

    // 根据搜索关键词过滤title
    let result = medias;
    if (keyword) {
      result = medias.filter(item => item.title.toLowerCase().includes(keyword.toLowerCase()));
    }

    // 根据排序条件排序
    switch (order) {
      case "play":
        result = [...result].sort((a, b) => (b.cnt_info?.play || 0) - (a.cnt_info?.play || 0));
        break;
      case "collect":
        result = [...result].sort((a, b) => (b.cnt_info?.collect || 0) - (a.cnt_info?.collect || 0));
        break;
      case "pubtime":
        result = [...result].sort((a, b) => (b.pubtime || 0) - (a.pubtime || 0));
        break;
      default:
        break;
    }

    return result;
  }, [data?.medias, keyword, order]);

  const onPlayAll = () => {
    if (filteredMedias.length > 0) {
      playList(
        filteredMedias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const addToPlayList = () => {
    if (filteredMedias.length > 0) {
      addList(
        filteredMedias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const toggleFavorite = async () => {
    if (isFavorite) {
      // 取消收藏
      const res = await postFavSeasonUnfav({
        season_id: Number(id),
        platform: "web",
      });

      if (res.code === 0) {
        rmCollectedFavorite(Number(id));
      }
    } else {
      // 收藏
      const res = await postFavSeasonFav({
        season_id: Number(id),
        platform: "web",
      });

      if (res.code === 0) {
        addCollectedFavorite({
          id: Number(id),
          title: data?.info?.title || "未命名合集",
          cover: data?.info?.cover,
          type: CollectionType.VideoCollections,
          mid: data?.info?.upper?.mid,
        });
      }
    }
  };

  const handleMenuAction = async (key: string, item: Media) => {
    switch (key) {
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
          sid: item.id,
          ownerName: item.upper?.name,
          ownerMid: item.upper?.mid,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.title,
            cover: item.cover,
            bvid: item.bvid,
            sid: item.id,
            ownerName: item.upper?.name,
            ownerMid: item.upper?.mid,
          },
        ]);
        break;
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: item.id,
          type: 2,
          title: item.title,
        });
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "download-video":
        await window.electron.addMediaDownloadTask({
          outputFileType: "video",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "bililink":
        window.electron.openExternal(`https://www.bilibili.com/video/${item.bvid}`);
        break;
      default:
        break;
    }
  };

  const isCreatedBySelf = data?.info?.upper?.mid === user?.mid;

  const getScrollElement = useCallback(() => {
    return scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null;
  }, []);

  return (
    <ScrollContainer enableBackToTop ref={scrollRef} resetOnChange={id} className="h-full w-full px-4 pb-6">
      <Header
        type={CollectionType.VideoCollections}
        cover={data?.info?.cover}
        title={data?.info?.title}
        desc={data?.info?.intro}
        upMid={data?.info?.upper?.mid}
        mediaCount={data?.info?.media_count}
      />

      <Operations
        loading={loading}
        type={CollectionType.VideoCollections}
        order={order}
        onKeywordSearch={setKeyword}
        onOrderChange={setOrder}
        orderOptions={[
          { key: "pubtime", label: "最近投稿" },
          { key: "play", label: "最多播放" },
          { key: "collect", label: "最多收藏" },
        ]}
        mediaCount={data?.info?.media_count}
        isFavorite={isFavorite}
        isCreatedBySelf={isCreatedBySelf}
        onToggleFavorite={toggleFavorite}
        onPlayAll={onPlayAll}
        onAddToPlayList={addToPlayList}
      />

      {displayMode === "card" ? (
        <SeriesGridList
          className="min-h-0 flex-1"
          data={filteredMedias}
          loading={loading}
          getScrollElement={getScrollElement}
          onMenuAction={handleMenuAction}
        />
      ) : (
        <SeriesList
          className="min-h-0 flex-1"
          data={filteredMedias}
          loading={loading}
          getScrollElement={getScrollElement}
          onMenuAction={handleMenuAction}
        />
      )}
    </ScrollContainer>
  );
};

export default VideoCollections;
