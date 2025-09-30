import { Fragment } from "react";
import { useParams } from "react-router";

import { Avatar, Divider, Image, Skeleton, Tooltip } from "@heroui/react";
import { RiUserFollowLine, RiUserUnfollowLine, RiVerifiedBadgeFill } from "@remixicon/react";
import { useRequest } from "ahooks";

import { UserRelation } from "@/common/constants/relation";
import AsyncButton from "@/components/async-button";
import { postRelationModify } from "@/service/relation-modify";
import { getRelationStat } from "@/service/relation-stat";
import { getSpaceWbiAccInfo } from "@/service/space-wbi-acc-info";
import { getSpaceWbiAccRelation } from "@/service/space-wbi-acc-relation";

export const UserRelationOperation = {
  [UserRelation.Unfollowed]: "关注",
  [UserRelation.QuietFollowed]: "已关注",
  [UserRelation.Followed]: "已关注",
  [UserRelation.MutualFollowed]: "已互粉",
  [UserRelation.Blocked]: "已拉黑",
};

const Profile = () => {
  const { id } = useParams();

  const { data, loading } = useRequest(
    async () => {
      const res = await getSpaceWbiAccInfo({
        mid: Number(id),
      });

      return res.data;
    },
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  const { data: relationData } = useRequest(
    async () => {
      const res = await getRelationStat({
        vmid: Number(id),
      });

      return res.data;
    },
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  const { data: userRelation } = useRequest(
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

  const isFollow = [UserRelation.Followed, UserRelation.MutualFollowed].includes(userRelation as UserRelation);

  const stats = [
    {
      title: "关注数",
      value: relationData?.following,
    },
    {
      title: "粉丝数",
      value: relationData?.follower,
    },
    {
      title: "等  级",
      value: `Lv${data?.level ?? 0}`,
    },
  ];

  const toggleFollow = async () => {
    let act = 0;

    if (isFollow) {
      act = 2;
    } else if (userRelation === UserRelation.Unfollowed) {
      act = 1;
    } else if (userRelation === UserRelation.Blocked) {
      act = 6;
    }

    await postRelationModify({
      fid: Number(id),
      act,
    });
  };

  if (loading) {
    return (
      <div className="flex p-4">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-6 w-[100px] rounded-lg" />
          <Skeleton className="h-6 w-[200px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Image
        src={data?.top_photo_v2?.l_200h_img}
        width="100%"
        height={200}
        alt={data?.name}
        className="object-cover"
        classNames={{
          wrapper: "opacity-70",
        }}
      />
      <div className="relative flex justify-between">
        <div className="absolute top-[50%] left-4 z-10 flex translate-y-[-50%] items-center space-x-4">
          <Avatar isBordered src={data?.face} alt={data?.name} className="h-30 w-30" />
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {Boolean(data?.official?.role) && (
                  <Tooltip closeDelay={0} content={data?.official?.title}>
                    <RiVerifiedBadgeFill color="#66AAF9" />
                  </Tooltip>
                )}
                <h1>{data?.name}</h1>
                <AsyncButton
                  size="sm"
                  color="primary"
                  startContent={isFollow ? <RiUserFollowLine size={18} /> : <RiUserUnfollowLine size={18} />}
                  onPress={toggleFollow}
                >
                  {UserRelationOperation[userRelation as UserRelation]}
                </AsyncButton>
              </div>
              {Boolean(data?.vip?.status) && (
                <Image height={24} src={data?.vip?.label?.img_label_uri_hans_static} alt={data?.vip?.label?.text} />
              )}
            </div>
            <p className="text-sm text-zinc-500">{data?.sign}</p>
          </div>
        </div>
        <div className="flex flex-auto items-center justify-end space-x-4 p-4">
          {stats.map((item, idx) => (
            <Fragment key={idx}>
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg">{item.value}</span>
                <span className="text-sm text-zinc-500">{item.title}</span>
              </div>
              {idx !== stats.length - 1 && <Divider orientation="vertical" className="h-4" />}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
