import React from "react";
import { useParams } from "react-router";

import { Tab, Tabs } from "@heroui/react";
import { useRequest } from "ahooks";
import { isNil } from "es-toolkit/predicate";

import { UserRelation } from "@/common/constants/relation";
import ScrollContainer from "@/components/scroll-container";
import { getSpaceWbiAccRelation } from "@/service/space-wbi-acc-relation";
import { useUser } from "@/store/user";

import Favorites from "./favorites";
import Profile from "./profile";
import VideoPost from "./video-post";
import VideoSeries from "./video-series";

/**
 * 用户个人中心
 */
const UserProfile = () => {
  const { id } = useParams();
  const user = useUser(s => s.user);

  const { data: relationWithMe, refreshAsync: refreshRelation } = useRequest(
    async () => {
      const res = await getSpaceWbiAccRelation({
        mid: Number(id),
      });

      return res.data?.relation?.attribute;
    },
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  const tabs = [
    {
      label: "收藏夹",
      key: "collection",
      hidden: id !== String(user?.mid),
      content: <Favorites />,
    },
    {
      label: "投稿",
      key: "video",
      content: <VideoPost />,
    },
    {
      label: "合集",
      key: "union",
      content: <VideoSeries />,
    },
  ].filter(item => !item.hidden);

  return (
    <ScrollContainer>
      <Profile relationWithMe={relationWithMe} refreshRelation={refreshRelation} />
      {!isNil(relationWithMe) && relationWithMe !== UserRelation.Blocked && (
        <div className="p-4">
          <Tabs disableAnimation size="lg" aria-label="个人资料栏目" variant="solid">
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
