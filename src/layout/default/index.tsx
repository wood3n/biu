import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useRequest } from "ahooks";
import { Card, CardBody, Spinner } from "@heroui/react";

import Navbar from "@/components/navbar";
import { getLoginStatus } from "@/service";
import { useUser } from "@/store/user";
import { useFavoriteSongs } from "@/store/user-favorite-songs";
import { useUserPlayList } from "@/store/user-playlist";

import DefaultMenu from "./default-menu";

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
      <Navbar />
      <div className="flex flex-grow space-x-2 p-2">
        <div className="flex w-72 flex-col space-y-2">
          <Card>
            <CardBody>
              <DefaultMenu />
            </CardBody>
          </Card>
          <Card className="flex-grow">
            <CardBody>
              <p>Make beautiful websites regardless of your design experience.</p>
            </CardBody>
          </Card>
        </div>
        <Card className="flex-3">
          <CardBody>
            <Outlet />
          </CardBody>
        </Card>
      </div>
      <div className="h-24 w-full border-t-1 border-zinc-800">playbar</div>
    </div>
  );
};

export default DefaultLayout;
