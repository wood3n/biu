import React from "react";

import { Tab, Tabs } from "@heroui/react";

import ScrollContainer from "@/components/scroll-container";

import Favorites from "./favorites";
import Profile from "./profile";
import VideoPost from "./video-post";
import VideoCollection from "./video-series";

/**
 * 用户个人中心
 */
const UserProfile = () => {
  const tabs = [
    {
      label: "投稿",
      key: "video",
      content: <VideoPost />,
    },
    {
      label: "收藏夹",
      key: "collection",
      content: <Favorites />,
    },
    {
      label: "合集",
      key: "union",
      content: <VideoCollection />,
    },
  ];

  return (
    <ScrollContainer>
      <Profile />
      <div className="mt-4 p-4">
        <Tabs disableAnimation size="lg" aria-label="个人资料栏目" variant="solid">
          {tabs.map(item => (
            <Tab key={item.key} title={item.label}>
              {item.content}
            </Tab>
          ))}
        </Tabs>
      </div>
    </ScrollContainer>
  );
};

export default UserProfile;
