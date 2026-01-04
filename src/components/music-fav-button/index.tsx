import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import { RiStarFill, RiStarLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import { useModalStore } from "@/store/modal";
import { useMusicFavStore } from "@/store/music-fav";
import { usePlayList } from "@/store/play-list";

const MusicFavButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const onOpenFavSelectModal = useModalStore(s => s.onOpenFavSelectModal);
  const isFav = useMusicFavStore(s => s.isFav);
  const refreshIsFav = useMusicFavStore(s => s.refreshIsFav);
  const setIsFav = useMusicFavStore(s => s.setIsFav);

  useEffect(() => {
    refreshIsFav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playItem]);

  const handleOpen = () => {
    if (!playItem) return;
    onOpenFavSelectModal({
      rid: playItem.type === "mv" ? String(playItem.aid) : String(playItem.sid),
      type: playItem.type === "mv" ? 2 : 12,
      title: "收藏",
      onSuccess: selectedIds => {
        setIsFav(Boolean(selectedIds?.length));

        if (location.pathname.startsWith("/collection/")) {
          const searchParams = new URLSearchParams(location.search);
          searchParams.set("refresh", Date.now().toString());

          navigate(
            {
              pathname: location.pathname,
              search: `?${searchParams.toString()}`,
            },
            {
              replace: true,
            },
          );
        }
      },
    });
  };

  return (
    <IconButton onPress={handleOpen}>
      {isFav ? <RiStarFill size={18} className="text-primary" /> : <RiStarLine size={18} />}
    </IconButton>
  );
};

export default MusicFavButton;
