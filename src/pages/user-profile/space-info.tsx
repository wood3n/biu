import { Fragment } from "react";
import { useParams } from "react-router";

import { Avatar, Divider, Image, Tooltip } from "@heroui/react";
import { RiAddLine, RiCheckLine, RiVerifiedBadgeFill } from "@remixicon/react";

import { UserRelation } from "@/common/constants/relation";
import { formatNumber } from "@/common/utils/number";
import AsyncButton from "@/components/async-button";
import { postRelationModify, UserRelationAction } from "@/service/relation-modify";
import { type RelationStatData } from "@/service/relation-stat";
import { type SpaceAccInfoData } from "@/service/space-wbi-acc-info";
import { useUser } from "@/store/user";

interface Props {
  spaceInfo?: SpaceAccInfoData;
  relationStats?: RelationStatData;
  relationWithMe?: number;
  refreshRelation: () => Promise<number>;
}

const SpaceInfo = ({ spaceInfo, relationStats, relationWithMe, refreshRelation }: Props) => {
  const user = useUser(s => s.user);
  const { id } = useParams();
  const isSelf = user?.mid === Number(id);

  const isFollow = [UserRelation.Followed, UserRelation.MutualFollowed].includes(relationWithMe as UserRelation);

  const stats = [
    {
      title: "关注数",
      value: relationStats?.following,
      hidden: !isSelf,
    },
    {
      title: "粉丝数",
      value: formatNumber(relationStats?.follower),
    },
    {
      title: "等  级",
      value: `Lv${spaceInfo?.level ?? 0}`,
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

  if (relationWithMe === UserRelation.Blocked) {
    return (
      <div className="flex h-[480px] w-full flex-col items-center justify-center space-y-6">
        <Avatar src={spaceInfo?.face} alt={spaceInfo?.name} className="h-[120px] w-[120px] shadow-lg" />
        <p className="text-lg">已拉黑</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-[200px] items-end justify-between space-x-8 bg-cover bg-center px-8 py-4 bg-blend-multiply"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${spaceInfo?.top_photo_v2?.l_200h_img}) center/cover no-repeat`,
      }}
    >
      <div className="flex min-w-0 grow items-end space-x-4">
        <Avatar src={spaceInfo?.face} alt={spaceInfo?.name} className="h-[140px] w-[140px] flex-none shadow-lg" />
        <div className="flex min-w-0 flex-1 flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {Boolean(spaceInfo?.official?.role) && (
                <Tooltip closeDelay={0} content={spaceInfo?.official?.title}>
                  <RiVerifiedBadgeFill color="#66AAF9" />
                </Tooltip>
              )}
              <h1>{spaceInfo?.name}</h1>
            </div>
            {Boolean(spaceInfo?.vip?.status) && (
              <Image
                height={24}
                src={spaceInfo?.vip?.label?.img_label_uri_hans_static}
                alt={spaceInfo?.vip?.label?.text}
              />
            )}
          </div>
          <p className="line-clamp-2 text-sm">{spaceInfo?.sign}</p>
        </div>
      </div>
      <div className="flex flex-none items-center space-x-4">
        {Boolean(user?.isLogin) && !isSelf && (
          <AsyncButton
            color={isFollow ? "primary" : "default"}
            startContent={isFollow ? <RiCheckLine size={18} /> : <RiAddLine size={18} />}
            onPress={toggleFollow}
            className="mt-2"
          >
            {isFollow ? "已关注" : "关注"}
          </AsyncButton>
        )}
        {user?.isLogin
          ? stats.map((item, idx) => (
              <Fragment key={idx}>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg">{item.value}</span>
                  <span className="text-sm whitespace-nowrap">{item.title}</span>
                </div>
                {idx !== stats.length - 1 && <Divider orientation="vertical" className="h-4" />}
              </Fragment>
            ))
          : null}
      </div>
    </div>
  );
};

export default SpaceInfo;
