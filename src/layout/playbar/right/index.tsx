import MusicDownloadButton from "@/components/music-download-button";
import MusicPlayMode from "@/components/music-play-mode";
import MusicRate from "@/components/music-rate";
import MusicVolume from "@/components/music-volume";
import OpenPlaylistDrawerButton from "@/components/open-playlist-drawer-button";
import { usePlayList } from "@/store/play-list";

const RightControl = () => {
  const playId = usePlayList(s => s.playId);

  return (
    <div className="flex h-full items-center justify-end space-x-2">
      <MusicPlayMode />
      {Boolean(playId) && <MusicDownloadButton />}
      <OpenPlaylistDrawerButton />
      <MusicVolume />
      <MusicRate />
    </div>
  );
};

export default RightControl;
