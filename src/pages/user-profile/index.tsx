import React from "react";
import { useParams } from "react-router";

import { Spinner, Tab, Tabs } from "@heroui/react";
import { useRequest } from "ahooks";

import { UserRelation } from "@/common/constants/relation";
import ScrollContainer from "@/components/scroll-container";
import { getRelationStat } from "@/service/relation-stat";
import { getXSpaceSettings } from "@/service/space-setting";
import { getSpaceWbiAccInfo } from "@/service/space-wbi-acc-info";
import { getSpaceWbiAccRelation } from "@/service/space-wbi-acc-relation";
import { useUser } from "@/store/user";

import Favorites from "./favorites";
import SpaceInfo from "./space-info";
import VideoPost from "./video-post";
import VideoSeries from "./video-series";

/**
 * 用户个人中心
 */
const UserProfile = () => {
  const { id } = useParams();
  const user = useUser(s => s.user);
  const isSelf = String(user?.mid) === id;

  const { data: userInfo, loading } = useRequest(
    async () => {
      const res = await getSpaceWbiAccInfo({
        mid: id as string,
      });

      if (res.code === 0) {
        return res.data;
      }
    },
    {
      ready: !!id,
      refreshDeps: [user?.isLogin, id],
    },
  );

  const { data: relationWithMe, refreshAsync: refreshRelation } = useRequest(
    async () => {
      const res = await getSpaceWbiAccRelation({
        mid: Number(id),
      });

      return res.data?.relation?.attribute;
    },
    {
      ready: Boolean(user?.isLogin) && !!id,
      refreshDeps: [id],
    },
  );

  const { data: relationStats } = useRequest(
    async () => {
      const res = await getRelationStat({
        vmid: Number(id),
      });

      return res.data;
    },
    {
      ready: Boolean(id) && relationWithMe !== UserRelation.Blocked,
      refreshDeps: [id],
    },
  );

  const { data: spacePrivacy } = useRequest(
    async () => {
      const res = await getXSpaceSettings({
        mid: Number(id),
        web_location: "333.1387",
      });

      return res.data?.privacy;
    },
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  const tabs = [
    {
      label: "投稿",
      key: "video",
      content: <VideoPost />,
    },
    {
      label: "收藏夹",
      key: "collection",
      hidden: !isSelf && !spacePrivacy?.fav_video,
      content: <Favorites />,
    },
    {
      label: "合集",
      key: "union",
      content: <VideoSeries />,
    },
  ].filter(item => !item.hidden);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <ScrollContainer className="h-full w-full">
      <SpaceInfo
        spaceInfo={userInfo}
        relationStats={relationStats}
        relationWithMe={relationWithMe}
        refreshRelation={refreshRelation}
      />
      {relationWithMe !== UserRelation.Blocked && (
        <div className="px-3 py-4">
          <Tabs radius="md" classNames={{ cursor: "rounded-medium" }} aria-label="个人资料栏目" variant="solid">
            {tabs.map(item => (
              <Tab key={item.key} title={item.label}>
                {item.content}
              </Tab>
            ))}
          </Tabs>
        </div>
      )}
    </ScrollContainer>
  );
};

export default UserProfile;
