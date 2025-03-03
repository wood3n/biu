import React from "react";
import { useNavigate } from "react-router-dom";

import { useRequest } from "ahooks";
import { Spinner } from "@heroui/react";

import PlayBar from "@/components/playbar";
import Navbar from "@/layout/default/navbar";
import { getLoginStatus } from "@/service";
import { useUser } from "@/store/user";
import { useFavoriteSongs } from "@/store/user-favorite-songs";
import { useUserPlayList } from "@/store/user-playlist";

import Content from "./content";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const updateUser = useUser(store => store.updateUser);
  const updateFavoriteSongs = useFavoriteSongs(store => store.updateFavoriteSongs);
  const updateUserPlayList = useUserPlayList(store => store.updatePlayList);

  // 获取登录状态
  const { loading } = useRequest(getLoginStatus, {
    onSuccess: async ({ data: loginStatus }) => {
      if (loginStatus?.profile?.userId) {
        const userId = loginStatus.profile.userId;

        Promise.allSettled([updateUser(userId), updateFavoriteSongs(userId), updateUserPlayList(userId)]);
      } else {
        navigate("/login", { replace: true });
      }
    },
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner color="primary" label="加载中..." labelColor="primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="window-drag h-16 w-full">
        <Navbar />
      </div>
      <Content className="min-h-0 flex-grow" />
      <div className="h-24 w-full border-t-1 border-zinc-800">
        <PlayBar />
      </div>
    </div>
  );
};

export default DefaultLayout;
