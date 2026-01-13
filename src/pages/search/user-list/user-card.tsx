import React, { useState } from "react";
import { useNavigate } from "react-router";

import { Avatar, Card, CardBody, addToast } from "@heroui/react";
import { RiAddLine, RiFlashlightFill, RiUserFollowLine } from "@remixicon/react";

import { formatNumber } from "@/common/utils/number";
import { formatUrlProtocol } from "@/common/utils/url";
import AsyncButton from "@/components/async-button";
import { postRelationModify, UserRelationAction } from "@/service/relation-modify";

import { type SearchUserItemWithRelation } from "./utils";

interface UserCardProps {
  u: SearchUserItemWithRelation;
}

const UserCard: React.FC<UserCardProps> = ({ u }) => {
  const navigate = useNavigate();
  const [isFollowed, setIsFollowed] = useState(u.is_followed);

  const handleFollow = async () => {
    try {
      const act = isFollowed ? UserRelationAction.Unfollow : UserRelationAction.Follow;
      const res = await postRelationModify({
        fid: u.mid,
        act,
        re_src: 11, // 搜索来源
      });
      if (res.code === 0) {
        setIsFollowed(!isFollowed);
        addToast({
          title: isFollowed ? "已取消关注" : "已关注",
          color: "success",
        });
      } else {
        addToast({
          title: res.message || "操作失败",
          color: "danger",
        });
      }
    } catch {
      addToast({
        title: "操作失败",
        color: "danger",
      });
    }
  };

  return (
    <Card isHoverable isPressable as="div" onPress={() => navigate(`/user/${u.mid}`)}>
      <CardBody className="flex flex-col items-center gap-y-2">
        {/* Avatar Section */}
        <div className="relative flex-none">
          <Avatar className="h-16 w-16" src={formatUrlProtocol(u.upic as string)} isBordered />
          {u.official_verify?.type === 0 && (
            <div className="bg-warning ring-background absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2">
              <RiFlashlightFill size={12} />
            </div>
          )}
          {u.official_verify?.type === 1 && (
            <div className="bg-primary ring-background absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2">
              <RiFlashlightFill size={12} />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex w-full min-w-0 grow flex-col items-center justify-between space-y-1">
          {/* Name & Level */}
          <div className="flex flex-col items-center space-y-1">
            <div className="flex w-full items-center justify-center gap-2">
              <span className="text-foreground truncate text-lg font-bold">{u.uname}</span>
              {u.level && (
                <span className="flex h-4 min-w-[24px] flex-none items-center justify-center rounded-[2px] bg-[#FB7299] px-1 text-[10px] font-bold text-white italic">
                  LV{u.level}
                </span>
              )}
            </div>
            <span className="text-small text-default-500 whitespace-nowrap">{formatNumber(u.fans)}粉丝</span>
          </div>

          {/* Stats & Sign */}
          <div className="text-small text-default-500 flex w-full min-w-0 flex-col items-center space-y-1">
            {u.usign && <span className="line-clamp-2 max-w-full min-w-0 flex-1 break-all">{u.usign}</span>}
          </div>
          {/* Button */}
          <div className="mt-2">
            <AsyncButton
              size="sm"
              color={isFollowed ? "success" : "default"}
              variant={isFollowed ? "flat" : "solid"}
              radius="sm"
              onPress={handleFollow}
              startContent={isFollowed ? <RiUserFollowLine size={18} /> : <RiAddLine size={18} />}
            >
              {isFollowed ? "已关注" : "关注"}
            </AsyncButton>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserCard;
