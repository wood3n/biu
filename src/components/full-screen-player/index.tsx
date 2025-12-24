import { useEffect, useState } from "react";

import { Button, Drawer, DrawerBody, DrawerContent, Image } from "@heroui/react";
import { RiArrowDownSLine } from "@remixicon/react";
import { useShallow } from "zustand/shallow";

import AudioWaveform from "@/components/audio-waveform";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import MusicPlayControl from "../music-play-control";
import WindowAction from "../window-action";

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
              <WindowAction />
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold">{playItem.pageTitle || playItem.title}</h2>
                <p className="mt-2 text-white/60">{playItem.ownerName}</p>
              </div>
              <div className="aspect-square w-[min(60vw,35vh)] max-w-[400px] shadow-lg md:mt-10">
                <Image
                  src={playItem.pageCover || playItem.cover}
                  className="h-full w-full object-cover"
                  removeWrapper
                  radius="md"
                />
              </div>
              {/* Waveform */}
              <div className="mt-4 flex-none md:mt-8" style={{ width: waveformWidth, height: 100 }}>
                {getAudio() && (
                  <AudioWaveform
                    audioElement={getAudio()!}
                    width={waveformWidth}
                    height={100}
                    barColor={primaryColor}
                    barCount={Math.floor(waveformWidth / 8)} // Approx spacing
                  />
                )}
              </div>
            </div>
            <div className="grid h-[88px] w-full grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] px-6">
              <div>测试</div>
              <MusicPlayControl />
              <div>测试</div>
            </div>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default FullScreenPlayer;
