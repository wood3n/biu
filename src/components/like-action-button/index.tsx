import React from "react";
import { MdOutlineFavorite, MdOutlineFavoriteBorder } from "react-icons/md";

import TooltipButton from "@/components/tooltip-button";
import { useLikelist } from "@/store/likelist-atom";

interface Props {
  id: number;
}

const LikeAction: React.FC<Props> = ({ id }) => {
  const { likelist, like, dislike } = useLikelist();

  const liked = likelist.includes(id);

  return (
    <TooltipButton size="small" disabled={!id} onClick={() => (liked ? dislike(id) : like(id))} title={liked ? "取消喜欢" : "喜欢"}>
      {liked ? <MdOutlineFavorite /> : <MdOutlineFavoriteBorder />}
    </TooltipButton>
  );
};

export default LikeAction;
