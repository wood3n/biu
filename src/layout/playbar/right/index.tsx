import MusicDownloadButton from "@/components/music-download-button";
import MusicFavButton from "@/components/music-fav-button";
import MusicPlayMode from "@/components/music-play-mode";
import PlayListDrawer from "@/components/music-playlist-drawer";
import MusicRate from "@/components/music-rate";
import MusicVolume from "@/components/music-volume";
import OpenPlaylistDrawerButton from "@/components/open-playlist-drawer-button";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

const RightControl = () => {
  const user = useUser(s => s.user);
  const playId = usePlayList(s => s.playId);

  return (
    <>
      <div className="flex h-full items-center justify-end space-x-2">
        <MusicPlayMode />
        {Boolean(user?.isLogin) && Boolean(playId) && <MusicFavButton />}
        {Boolean(playId) && <MusicDownloadButton />}
        <OpenPlaylistDrawerButton />
        <MusicVolume />
        <MusicRate />
      </div>
      <PlayListDrawer />
    </>
  );
};

export default RightControl;
