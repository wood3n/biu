import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Button, Drawer, DrawerBody, DrawerContent, Image } from "@heroui/react";
import { RiArrowDownSLine, RiExternalLinkLine } from "@remixicon/react";
import { useShallow } from "zustand/shallow";

import { openBiliVideoLink } from "@/common/utils/url";
import AudioWaveform from "@/components/audio-waveform";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import MusicDownloadButton from "../music-download-button";
import MusicFavButton from "../music-fav-button";
import MusicPlayControl from "../music-play-control";
import MusicPlayMode from "../music-play-mode";
import MusicPlayProgress from "../music-play-progress";
import MusicRate from "../music-rate";
import MusicVolume from "../music-volume";
import OpenPlaylistDrawerButton from "../open-playlist-drawer-button";
import WindowAction from "../window-action";
import PageList from "./page-list";

const platform = window.electron.getPlatform();

const FullScreenPlayer = () => {
  const isOpen = useModalStore(s => s.isFullScreenPlayerOpen);
  const close = useModalStore(s => s.closeFullScreenPlayer);
  const { playId, list, getAudio } = usePlayList(
    useShallow(state => ({
      playId: state.playId,
      list: state.list,
      getAudio: state.getAudio,
    })),
  );
  const primaryColor = useSettings(s => s.primaryColor);
  const playItem = list.find(item => item.id === playId);
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const waveformWidth = windowWidth * 0.8;

  if (!playItem) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      placement="bottom"
      size="full"
      backdrop="blur"
      hideCloseButton
      classNames={{
        base: "bg-transparent shadow-none m-0!",
        wrapper: "z-200",
        backdrop: "bg-black/80",
      }}
    >
      <DrawerContent className="flex h-full flex-col overflow-hidden">
        {onClose => (
          <DrawerBody className="gap-0 p-0">
            <div className="window-drag flex w-full items-center justify-end p-4">
              <Button
                title="关闭弹窗"
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="window-no-drag"
              >
                <RiArrowDownSLine size={24} />
              </Button>
              {["linux", "windows"].includes(platform) && <WindowAction />}
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-between">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold">{playItem.pageTitle || playItem.title}</h2>
                <button
                  type="button"
                  className="mt-2 text-white/60 hover:underline"
                  onClick={() => {
                    onClose();
                    navigate(`/user/${playItem.ownerMid}`);
                  }}
                >
                  {playItem.ownerName}
                </button>
              </div>
              <div className="flex min-h-0 w-full flex-1 items-center justify-center pr-6 pl-12">
                {playItem.hasMultiPart && <div className="mr-4 w-[320px] max-w-[30vw] flex-none" />}
                <div className="flex flex-1 items-center justify-center shadow-lg">
                  <Image
                    isBlurred
                    src={playItem.pageCover || playItem.cover}
                    className="aspect-square w-[min(60vw,35vh)] max-w-[400px] object-cover"
                    radius="md"
                  />
                </div>
                {playItem.hasMultiPart && (
                  <div className="ml-4 h-[60vh] w-[320px] max-w-[30vw] flex-none">
                    <PageList />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex-none" style={{ width: waveformWidth, height: 90 }}>
                {getAudio() && (
                  <AudioWaveform
                    audioElement={getAudio()!}
                    width={waveformWidth}
                    height={80}
                    barColor={primaryColor}
                    barCount={Math.floor(waveformWidth / 8)} // Approx spacing
                  />
                )}
              </div>
              <MusicPlayProgress className="w-full px-8" />
              <div className="grid h-16 w-full grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] px-6">
                <div className="flex h-full items-center space-x-2">
                  <Button
                    title="打开B站链接"
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      openBiliVideoLink(playItem);
                    }}
                  >
                    <RiExternalLinkLine size={18} />
                  </Button>
                  <MusicFavButton />
                </div>
                <MusicPlayControl />
                <div className="flex h-full items-center justify-end space-x-2">
                  <MusicPlayMode />
                  <MusicDownloadButton />
                  <OpenPlaylistDrawerButton />
                  <MusicVolume />
                  <MusicRate />
                </div>
              </div>
            </div>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default FullScreenPlayer;
