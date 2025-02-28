import React from "react";

import { Button, Tooltip } from "@heroui/react";
import { RiHeart3Fill, RiHeart3Line } from "@remixicon/react";

import { postLike } from "@/service";
import { useUser } from "@/store/user";
import { useFavoriteSongs } from "@/store/user-favorite-songs";

interface Props {
  id: number;
}

const SwitchFavorite: React.FC<Props> = ({ id }) => {
  const user = useUser(store => store.user);
  const { songs, updateFavoriteSongs } = useFavoriteSongs();
  const liked = songs?.includes(id);

  const switchLike = async () => {
    await postLike({
      id,
      like: !liked,
    });

    await updateFavoriteSongs(user?.profile?.userId as number);
  };

  return (
    <Tooltip content={liked ? "取消喜欢" : "喜欢"}>
      <Button size="sm" variant="light" isIconOnly onPress={switchLike}>
        {liked ? <RiHeart3Fill color="#F31260" size={18} /> : <RiHeart3Line size={18} />}
      </Button>
    </Tooltip>
  );
};

export default SwitchFavorite;
