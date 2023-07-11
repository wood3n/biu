import { useState } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { getLikelist, postLike } from '@/service';
import { userAtom } from './user-atom';

/**
 * 所有喜欢的歌曲id
 */
export const likelistAtom = atom<number[]>([]);

export const useLikelist = () => {
  const user = useAtomValue(userAtom);
  const [loading, setLoading] = useState(false);
  const [likelist, setLikelist] = useAtom(likelistAtom);

  const refresh = async () => {
    const { ids } = await getLikelist({
      uid: user?.userInfo?.profile?.userId,
    });

    if (Array.isArray(ids)) {
      setLikelist(ids);
    }
  };

  const like = (id: number) => {
    setLoading(true);
    return postLike({
      id,
    }).then(refresh).finally(() => {
      setLoading(false);
    });
  };

  const dislike = (id: number) => {
    setLoading(true);
    return postLike({
      like: false,
      id,
    }).then(refresh).finally(() => {
      setLoading(false);
    });
  };

  return {
    loading,
    likelist,
    like,
    dislike,
  };
};
