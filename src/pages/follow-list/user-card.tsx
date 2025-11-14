import React from "react";
import { useNavigate } from "react-router";

import { Avatar, Card, CardBody, addToast } from "@heroui/react";
import { RiDislikeLine } from "@remixicon/react";

import type { RelationListItem } from "@/service/relation-followings";

import AsyncButton from "@/components/async-button";
import { postRelationModify, UserRelationAction } from "@/service/relation-modify";

interface Props {
  u: RelationListItem;
  refresh: () => void;
}

const UserCard = ({ u, refresh }: Props) => {
  const navigate = useNavigate();

  const handleUnfollow = async () => {
    const res = await postRelationModify({ fid: u.mid, act: UserRelationAction.Unfollow });
    if (res?.code !== 0) {
      addToast({
        title: "取消关注失败",
        color: "danger",
      });
      return;
    }

    refresh();
  };

  return (
    <Card
      key={u.mid}
      radius="md"
      as="div"
      isHoverable
      isPressable
      onPress={() => navigate(`/user/${u.mid}`)}
      className="group relative h-full"
    >
      <CardBody className="flex items-center space-y-2">
        <Avatar className="text-large h-32 w-32 flex-none" src={u.face} name={u.uname} />
        <div className="flex w-full flex-col items-center space-y-1">
          <span className="text-lg">{u.uname}</span>
          <span className="text-foreground-500 line-clamp-2 w-full text-center text-sm">{u.sign}</span>
        </div>
      </CardBody>
      <AsyncButton
        size="sm"
        color="default"
        radius="md"
        variant="light"
        isIconOnly
        onPress={handleUnfollow}
        aria-label="取消关注"
        title="取消关注"
        className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
      >
        <RiDislikeLine />
      </AsyncButton>
    </Card>
  );
};

export default UserCard;
