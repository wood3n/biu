import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { Chip, Drawer, DrawerBody, DrawerContent, Image } from "@heroui/react";
import { RiArrowDownSLine, RiArrowLeftSLine, RiPulseLine } from "@remixicon/react";
import { useClickAway } from "ahooks";
import { useShallow } from "zustand/shallow";

import { hexToHsl } from "@/common/utils/color";
import AudioWaveform from "@/components/audio-waveform";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Empty from "../empty";
import IconButton from "../icon-button";
import MusicDownloadButton from "../music-download-button";
import MusicFavButton from "../music-fav-button";
import MusicPlayControl from "../music-play-control";
import MusicPlayMode from "../music-play-mode";
import MusicPlayProgress from "../music-play-progress";
import MusicRate from "../music-rate";
import MusicVolume from "../music-volume";
import OpenPlaylistDrawerButton from "../open-playlist-drawer-button";
import WindowAction from "../window-action";
import { useGlassmorphism } from "./glassmorphism";
import PageList from "./page-list";

const platform = window.electron.getPlatform();

const FullScreenPlayer = () => {
  const user = useUser(s => s.user);
  const isOpen = useModalStore(s => s.isFullScreenPlayerOpen);
  const close = useModalStore(s => s.closeFullScreenPlayer);
  const { playId, list } = usePlayList(
    useShallow(state => ({
      playId: state.playId,
      list: state.list,
    })),
  );
  const primaryColor = useSettings(s => s.primaryColor);
  const playItem = list.find(item => item.id === playId);
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);
  const [isPageListOpen, setIsPageListOpen] = useState(false);
  const [isWaveOpen, setIsWaveOpen] = useState(false);

  const pageListRef = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    if (isPageListOpen) {
      setIsPageListOpen(false);
    }
  }, pageListRef);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const waveformWidth = Math.min(windowWidth * 0.82, 900);

  const coverSrc = playItem?.pageCover || playItem?.cover;
  const { effectsProfile, bgLayerA, bgLayerB, activeBgLayer, cssVars } = useGlassmorphism(
    coverSrc,
    primaryColor,
    isOpen,
  );

  const themeVars = useMemo(
    () => ({
      ...cssVars,
      ["--heroui-primary" as any]: hexToHsl(primaryColor),
      ["--primary" as any]: hexToHsl(primaryColor),
    }),
    [cssVars, primaryColor],
  );

  if (!playItem) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      placement="bottom"
      size="full"
      radius="none"
      isDismissable={false}
      hideCloseButton
      classNames={{
        base: "bg-transparent shadow-none m-0!",
        // wrapper: "z-200",
        backdrop: "bg-background",
      }}
    >
      <DrawerContent className="dark text-foreground relative flex h-full flex-col overflow-hidden" style={themeVars}>
        {onClose =>
          !isOpen ? (
            <Empty />
          ) : (
            <DrawerBody className="relative gap-0 overflow-hidden p-0">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: activeBgLayer === "a" ? 1 : 0,
                    transition: `opacity ${effectsProfile.transitionMs}ms ease`,
                    willChange: "opacity",
                  }}
                >
                  {bgLayerA.coverSrc && (
                    <div
                      className="absolute inset-0 scale-[1.15] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${bgLayerA.coverSrc})`,
                        filter: `blur(${effectsProfile.blurPx}px)`,
                        opacity: 0.92,
                        willChange: "transform, filter, opacity",
                        transition: `filter ${effectsProfile.transitionMs}ms ease, opacity ${effectsProfile.transitionMs}ms ease`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: bgLayerA.gradientBackground,
                      willChange: "opacity",
                    }}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: activeBgLayer === "b" ? 1 : 0,
                    transition: `opacity ${effectsProfile.transitionMs}ms ease`,
                    willChange: "opacity",
                  }}
                >
                  {bgLayerB.coverSrc && (
                    <div
                      className="absolute inset-0 scale-[1.15] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${bgLayerB.coverSrc})`,
                        filter: `blur(${effectsProfile.blurPx}px)`,
                        opacity: 0.92,
                        willChange: "transform, filter, opacity",
                        transition: `filter ${effectsProfile.transitionMs}ms ease, opacity ${effectsProfile.transitionMs}ms ease`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: bgLayerB.gradientBackground,
                      willChange: "opacity",
                    }}
                  />
                </div>
              </div>

              <div className="window-drag flex w-full items-center justify-end p-4 text-white">
                <IconButton title="关闭弹窗" onPress={onClose} className="window-no-drag">
                  <RiArrowDownSLine size={24} />
                </IconButton>
                {["linux", "windows"].includes(platform) && <WindowAction />}
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-between">
                <div className="p-6 text-center text-white">
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
                  {(playItem.isLossless || playItem.isDolby) && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {playItem.isLossless && (
                        <Chip
                          size="sm"
                          classNames={{
                            base: "bg-[#ffe443]/20 border border-[#ffe443]/30 backdrop-blur-md",
                            content: "text-[#ffe443] font-medium text-xs",
                          }}
                        >
                          无损
                        </Chip>
                      )}
                      {playItem.isDolby && (
                        <Chip
                          size="sm"
                          classNames={{
                            base: "bg-[#00A1D6]/20 border border-[#00A1D6]/30 backdrop-blur-md",
                            content: "text-[#00A1D6] font-medium text-xs",
                          }}
                        >
                          杜比音频
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                  <Image
                    src={coverSrc}
                    className="aspect-[4/3] w-[min(60vw,42vh)] max-w-[480px] object-cover transition-shadow ease-out"
                    radius="lg"
                    style={{
                      boxShadow: `0 28px 90px -35px rgb(var(--glow-rgb) / 0.55), 0 10px 32px -18px rgb(0 0 0 / 0.55)`,
                      transition: `box-shadow ${effectsProfile.transitionMs}ms ease`,
                      aspectRatio: "4 / 3",
                    }}
                  />

                  <PageList
                    ref={pageListRef}
                    className={`absolute top-1/2 right-0 z-30 -translate-y-1/2 rounded-r-none transition-all duration-300 ease-out ${
                      isPageListOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
                    }`}
                    style={{
                      width: 320,
                      height: "min(42vh, 420px)",
                    }}
                    onClose={() => setIsPageListOpen(false)}
                  />

                  {playItem.hasMultiPart && !isPageListOpen && (
                    <div className="absolute top-1/2 right-0 z-20 -translate-y-1/2">
                      <IconButton
                        className="h-24 w-6 min-w-0 rounded-l-xl rounded-r-none bg-white/10 px-0 backdrop-blur-md transition-colors hover:bg-white/20"
                        onPress={() => setIsPageListOpen(!isPageListOpen)}
                        tooltip={isPageListOpen ? "关闭分集列表" : "显示分集列表"}
                        tooltipProps={{
                          placement: "left",
                        }}
                      >
                        <RiArrowLeftSLine size={24} className="text-white/80" />
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col items-center px-4 pb-6">
                <div className="w-full max-w-5xl">
                  <div className="flex flex-col items-center px-4 pt-4">
                    <div className="mb-2 flex-none" style={{ width: waveformWidth, height: 90 }}>
                      {isOpen && isWaveOpen && (
                        <AudioWaveform
                          width={waveformWidth}
                          height={80}
                          barColor={primaryColor}
                          barCount={Math.floor(waveformWidth / 8)}
                        />
                      )}
                    </div>
                    <MusicPlayProgress className="w-full px-3" trackClassName="h-[6px]" />
                  </div>
                  <div className="grid h-16 w-full grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] px-6">
                    <div className="flex h-full items-center space-x-2">
                      {Boolean(user?.isLogin) && <MusicFavButton />}
                      <MusicDownloadButton />
                      <IconButton
                        tooltip={isWaveOpen ? "隐藏动态频谱" : "显示动态频谱"}
                        className={isWaveOpen ? "text-primary" : ""}
                        onPress={() => setIsWaveOpen(!isWaveOpen)}
                        title="动态频谱显示切换"
                      >
                        <RiPulseLine size={18} />
                      </IconButton>
                    </div>
                    <MusicPlayControl />
                    <div className="flex h-full items-center justify-end space-x-2">
                      <MusicPlayMode />
                      <OpenPlaylistDrawerButton />
                      <MusicVolume />
                      <MusicRate />
                    </div>
                  </div>
                </div>
              </div>
            </DrawerBody>
          )
        }
      </DrawerContent>
    </Drawer>
  );
};

export default FullScreenPlayer;
