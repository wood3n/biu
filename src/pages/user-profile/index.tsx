import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import clx from "classnames";
import { Chip, Image, Tab, Tabs, Tooltip } from "@heroui/react";
import { RiMenLine, RiPlayListLine, RiStarFill, RiStarLine, RiWomenLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import If from "@/components/if";
import ScrollContainer from "@/components/scroll-container";
import UserPlayList from "@/components/user-playlist";
import { getUserDetail, getUserPlaylist } from "@/service";
import { useUser } from "@/store/user";

// import { useUser } from '@/common/hooks';

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const { id } = useParams();
  const user = useUser(store => store.user);
  const [tab, setTab] = useState<string>("playlist");

  const { data: userDetail, loading } = useRequest(
    () =>
      getUserDetail({
        uid: id,
      }),
    {
      refreshDeps: [id],
    },
  );

  const { data: playlist } = useRequest(
    async () => {
      const res = await getUserPlaylist({
        uid: id,
        limit: userDetail?.profile?.playlistCount,
        offset: 0,
      });

      return res?.playlist;
    },
    {
      ready: Boolean(userDetail?.profile?.playlistCount),
      refreshDeps: [id],
    },
  );

  const isSelf = userDetail?.profile?.userId === user?.profile?.userId;
  const follow = async () => {};

  const tabs = [
    {
      key: "playlist",
      icon: <RiPlayListLine size={18} />,
      title: "歌单",
      count: playlist?.length,
      hidden: !playlist?.length,
      content: <UserPlayList data={playlist} />,
    },
  ];

  return (
    <ScrollContainer className="p-6">
      <div className="mb-6 flex space-x-6">
        <div className="h-60 w-60 flex-none">
          <Image isBlurred src={userDetail?.profile?.avatarUrl} width="100%" height="100%" radius="full" />
        </div>
        <div className="flex flex-grow flex-col items-start justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{userDetail?.profile?.nickname}</span>
            <div className="flex items-center space-x-2">
              <If condition={userDetail?.profile?.gender}>
                <Chip
                  size="sm"
                  className={clx({
                    "bg-blue-500": userDetail?.profile?.gender === 1,
                    "bg-pink-500": userDetail?.profile?.gender === 2,
                  })}
                >
                  {userDetail?.profile?.gender === 1 ? <RiMenLine size={14} /> : <RiWomenLine size={14} />}
                </Chip>
              </If>
              <Chip size="sm">LV {userDetail?.level}</Chip>
              <If condition={!isSelf}>
                <Tooltip content={userDetail?.profile?.followed ? "取消关注" : "关注"}>
                  <AsyncButton isIconOnly variant="light" size="sm" onPress={follow} color="default">
                    {userDetail?.profile?.followed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
                  </AsyncButton>
                </Tooltip>
              </If>
            </div>
            <If condition={userDetail?.profile?.signature}>
              <Ellipsis
                lines={2}
                showMore={{
                  title: "简介",
                  content: userDetail?.profile?.signature,
                }}
              >
                {userDetail?.profile?.signature}
              </Ellipsis>
            </If>
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        {/* @ts-ignore */}
        <Tabs aria-label="个人歌单" size="lg" selectedKey={tab} onSelectionChange={setTab}>
          {tabs
            .filter(item => !item.hidden)
            .map(item => (
              <Tab
                key={item.key}
                title={
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.title}</span>
                    {Boolean(item.count) && (
                      <Chip size="sm" variant="faded">
                        {item.count}
                      </Chip>
                    )}
                  </div>
                }
              />
            ))}
        </Tabs>
      </div>
      {tabs.find(item => item.key === tab)?.content}
    </ScrollContainer>
  );
};

export default UserProfile;
