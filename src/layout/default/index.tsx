import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useRequest } from "ahooks";
import { Spinner } from "@heroui/react";

import LayoutNavbar from "@/components/navbar";
import { getLoginStatus } from "@/service";
import { useUser } from "@/store/user";
import { useFavoriteSongs } from "@/store/user-favorite-songs";
import { useUserPlayList } from "@/store/user-playlist";

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
        navigate("/login");
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
      <LayoutNavbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <div className="h-24 w-full">playbar</div>
    </div>
  );
};

export default DefaultLayout;
