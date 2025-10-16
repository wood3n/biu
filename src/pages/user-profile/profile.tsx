import { Fragment } from "react";
import { useParams } from "react-router";

import { Avatar, Divider, Image, Skeleton, Tooltip } from "@heroui/react";
import { RiAddLine, RiCheckLine, RiVerifiedBadgeFill } from "@remixicon/react";
import { useRequest } from "ahooks";

import { UserRelation } from "@/common/constants/relation";
import AsyncButton from "@/components/async-button";
import { postRelationModify, UserRelationAction } from "@/service/relation-modify";
import { getRelationStat } from "@/service/relation-stat";
import { getSpaceWbiAccInfo } from "@/service/space-wbi-acc-info";
import { useUser } from "@/store/user";

interface Props {
  relationWithMe?: number;
  refreshRelation: () => Promise<number>;
}

const Profile = ({ relationWithMe, refreshRelation }: Props) => {
  const user = useUser(s => s.user);
  const { id } = useParams();
  const isSelf = user?.mid === Number(id);

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
      ready: !!id && relationWithMe !== UserRelation.Blocked,
      refreshDeps: [id],
    },
  );

  const isFollow = [UserRelation.Followed, UserRelation.MutualFollowed].includes(relationWithMe as UserRelation);

  const stats = [
    {
      title: "关注数",
      value: relationData?.following,
      hidden: !isSelf,
    },
    {
      title: "粉丝数",
      value: relationData?.follower,
    },
    {
      title: "等  级",
      value: `Lv${data?.level ?? 0}`,
    },
  ].filter(item => !item.hidden);

  const toggleFollow = async () => {
    let act = 0;

    if (isFollow) {
      act = UserRelationAction.Unfollow;
    } else if (relationWithMe === UserRelation.Unfollowed) {
      act = UserRelationAction.Follow;
    } else if (relationWithMe === UserRelation.Blocked) {
      act = UserRelationAction.Unblock;
    }

    const res = await postRelationModify({
      fid: Number(id),
      act,
    });

    if (res?.code === 0) {
      await refreshRelation();
    }
  };

  if (loading) {
    return (
      <div className="mb-4 flex items-end space-x-4 p-4">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-6 w-[100px] rounded-lg" />
          <Skeleton className="h-6 w-[200px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (relationWithMe === UserRelation.Blocked) {
    return (
      <div className="flex h-[480px] w-full flex-col items-center justify-center space-y-6">
        <Avatar src={data?.face} alt={data?.name} className="h-[120px] w-[120px] shadow-lg" />
        <p className="text-lg">已拉黑</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex h-[200px] items-end justify-between bg-cover bg-center px-8 py-4 bg-blend-multiply"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${data?.top_photo_v2?.l_200h_img}) center/cover no-repeat`,
        }}
      >
        <div className="flex items-end space-x-4">
          <Avatar src={data?.face} alt={data?.name} className="h-[140px] w-[140px] shadow-lg" />
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {Boolean(data?.official?.role) && (
                  <Tooltip closeDelay={0} content={data?.official?.title}>
                    <RiVerifiedBadgeFill color="#66AAF9" />
                  </Tooltip>
                )}
                <h1>{data?.name}</h1>
              </div>
              {Boolean(data?.vip?.status) && (
                <Image height={24} src={data?.vip?.label?.img_label_uri_hans_static} alt={data?.vip?.label?.text} />
              )}
            </div>
            <p className="truncate text-sm">{data?.sign}</p>
          </div>
        </div>
        <div className="flex flex-auto items-center justify-end space-x-4">
          {!isSelf && (
            <AsyncButton
              color={isFollow ? "primary" : "default"}
              startContent={isFollow ? <RiCheckLine size={18} /> : <RiAddLine size={18} />}
              onPress={toggleFollow}
              className="mt-2"
            >
              {isFollow ? "已关注" : "关注"}
            </AsyncButton>
          )}
          {stats.map((item, idx) => (
            <Fragment key={idx}>
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg">{item.value}</span>
                <span className="text-sm">{item.title}</span>
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
