import { atom, useAtom, useAtomValue } from 'jotai';
import { getLikelist } from '@/service';
import { userAtom } from './userAtom';

/**
 * 所有喜欢的歌曲id
 */
export const likelistAtom = atom<number[]>([]);

export const useLikelist = () => {
  const user = useAtomValue(userAtom);
  const [likelist, setLikelist] = useAtom(likelistAtom);

  const refresh = async () => {
    const { ids } = await getLikelist({
      uid: user?.userInfo?.profile?.userId,
    });

    if (Array.isArray(ids)) {
      setLikelist(ids);
    }
  };

  return {
    likelist,
    refresh,
  };
};
