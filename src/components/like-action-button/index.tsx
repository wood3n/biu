import React from 'react';
import TooltipButton from '@/components/tooltip-button';
import {
  MdPlayCircle,
  MdSkipNext,
  MdQueueMusic,
  MdShuffle,
  MdAdd,
  MdDownloadForOffline,
  MdOutlineSearch,
  MdFileDownload,
  MdShare,
  MdOutlinePlaylistAddCircle,
  MdAccessTime,
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
  MdPlayArrow,
} from 'react-icons/md';
import { useAtom } from 'jotai';
import { useLikelist } from '@/store/likelistAtom';

interface Props {
  id?: number;
}

const LikeAction: React.FC<Props> = ({
  id,
}) => {
  const { likelist, like, dislike } = useLikelist();

  return likelist.includes(id as number) ? (
    <TooltipButton size="small" disabled={!id} onClick={() => dislike(id!)} tooltip="取消喜欢">
      <MdOutlineFavorite />
    </TooltipButton>
  ) : (
    <TooltipButton size="small" disabled={!id} onClick={() => like(id!)} tooltip="喜欢">
      <MdOutlineFavoriteBorder />
    </TooltipButton>
  );
};

export default LikeAction;
