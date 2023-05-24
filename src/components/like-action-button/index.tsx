import React from 'react';
import TooltipButton from '@/components/tooltip-button';
import {
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
} from 'react-icons/md';
import { useLikelist } from '@/store/likelist-atom';

interface Props {
  id: number;
}

const LikeAction: React.FC<Props> = ({
  id,
}) => {
  const { likelist, like, dislike } = useLikelist();

  const liked = likelist.includes(id);

  return (
    <TooltipButton
      size="small"
      disabled={!id}
      onClick={() => (liked ? dislike(id) : like(id))}
      tooltip={liked ? '取消喜欢' : '喜欢'}
    >
      {liked ? <MdOutlineFavorite /> : <MdOutlineFavoriteBorder />}
      <MdOutlineFavorite />
    </TooltipButton>
  );
};

export default LikeAction;
