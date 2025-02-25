import React from "react";

import { Button, Tooltip } from "@heroui/react";
import { RiDislikeFill, RiHeartLine } from "@remixicon/react";

import { postLike } from "@/service";
import { useFavoriteSongs } from "@/store/user-favorite-songs";

interface Props {
  id: number;
}

const SwitchFavorite: React.FC<Props> = ({ id }) => {
  const songs = useFavoriteSongs(store => store.songs);
  const liked = songs?.includes(id);

  const switchLike = async () => {
    await postLike({
      id,
      like: !liked,
    });
  };

  return (
    <Tooltip onClick={switchLike} title={liked ? "取消喜欢" : "喜欢"}>
      <Button size="sm" variant="light" isIconOnly>
        {liked ? <RiDislikeFill size={18} /> : <RiHeartLine size={18} />}
      </Button>
    </Tooltip>
  );
};

export default SwitchFavorite;
