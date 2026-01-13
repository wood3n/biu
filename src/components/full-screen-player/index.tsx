import { useEffect, useMemo, useRef, useState } from "react";

import { Drawer, DrawerBody, DrawerContent, Image } from "@heroui/react";
import { RiArrowDownSLine, RiArrowLeftSLine } from "@remixicon/react";
import { useClickAway } from "ahooks";
import clsx from "classnames";
import { useShallow } from "zustand/shallow";

import { hexToHsl } from "@/common/utils/color";
import Lyrics from "@/components/lyrics";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import Empty from "../empty";
import IconButton from "../icon-button";
import MusicPlayControl from "../music-play-control";
import MusicPlayMode from "../music-play-mode";
import MusicPlayProgress from "../music-play-progress";
import OpenPlaylistDrawerButton from "../open-playlist-drawer-button";
import WindowAction from "../window-action";
import { useGlassmorphism } from "./glassmorphism";
import PageList from "./page-list";

const platform = window.electron.getPlatform();

const FullScreenPlayer = () => {
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

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);
  const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [isPageListOpen, setIsPageListOpen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(false);

  const pageListRef = useRef<HTMLDivElement>(null);
  const hideUiTimeoutRef = useRef<number | null>(null);

  useClickAway(() => {
    if (isPageListOpen) {
      setIsPageListOpen(false);
    }
  }, pageListRef);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (hideUiTimeoutRef.current) {
        window.clearTimeout(hideUiTimeoutRef.current);
        hideUiTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsUiVisible(true);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (hideUiTimeoutRef.current) {
      window.clearTimeout(hideUiTimeoutRef.current);
      hideUiTimeoutRef.current = null;
    }
    setIsUiVisible(true);
  };

  const scheduleHideUi = (delay: number) => {
    if (hideUiTimeoutRef.current) {
      window.clearTimeout(hideUiTimeoutRef.current);
    }
    hideUiTimeoutRef.current = window.setTimeout(() => {
      setIsUiVisible(false);
    }, delay);
  };

  const handleMouseLeave = () => {
    scheduleHideUi(2000);
  };

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

  const coverWidth = Math.max(260, Math.min(windowWidth * 0.7, windowHeight * 0.48, 520));
  const coverHeight = coverWidth * 0.75;

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
      <DrawerContent className="dark text-foreground relative h-full overflow-hidden" style={themeVars}>
        {onClose =>
          !isOpen ? (
            <Empty />
          ) : (
            <DrawerBody
              className="group/player relative flex flex-row gap-0 overflow-hidden p-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={() => {
                setIsUiVisible(true);
                scheduleHideUi(3000);
              }}
            >
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
              <div
                className={`absolute top-0 right-0 z-20 flex w-full justify-between px-6 py-4 transition-opacity duration-200 ${isUiVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <div className="window-no-drag top-0 right-0 left-0 flex w-full max-w-2/5 items-center space-x-2">
                  <IconButton title="关闭弹窗" onPress={onClose} className="">
                    <RiArrowDownSLine size={28} />
                  </IconButton>
                  <h2 className="truncate text-xl">{playItem.pageTitle || playItem.title}</h2>
                </div>
                <div className="window-no-drag top-0 right-0">
                  {platform === "linux" || platform === "windows" ? <WindowAction /> : null}
                </div>
              </div>

              <div className="flex h-full w-full items-center justify-center">
                <div className="flex h-full w-full items-center justify-end px-12">
                  <Image
                    src={coverSrc}
                    radius="lg"
                    className="transition-shadow ease-out"
                    classNames={{
                      img: "w-full h-full object-cover",
                    }}
                    style={{
                      width: coverWidth,
                      height: coverHeight,
                      boxShadow: `0 28px 90px -35px rgb(var(--glow-rgb) / 0.55), 0 10px 32px -18px rgb(0 0 0 / 0.55)`,
                      transition: `box-shadow ${effectsProfile.transitionMs}ms ease`,
                      aspectRatio: "4 / 3",
                    }}
                  />
                </div>

                <div className="h-full w-full overflow-hidden px-12 py-24">
                  <Lyrics />
                </div>
              </div>

              <div
                className={clsx("absolute inset-x-0 bottom-0 z-30 transition-opacity duration-200", {
                  "pointer-events-auto opacity-100": isUiVisible,
                  "pointer-events-none opacity-0": !isUiVisible,
                })}
              >
                <div className="mx-auto mb-4 flex w-full max-w-6xl flex-col items-center gap-2 px-12">
                  <MusicPlayProgress className="w-full" trackClassName="h-[6px]" />
                  <div className="flex w-full items-center justify-center space-x-4">
                    <MusicPlayMode />
                    <MusicPlayControl />
                    <OpenPlaylistDrawerButton />
                  </div>
                </div>
              </div>

              {isUiVisible && playItem.hasMultiPart && !isPageListOpen && (
                <div className="absolute top-1/2 right-0 z-20 -translate-y-1/2">
                  <IconButton
                    className="h-24 w-6 min-w-0 rounded-l-xl rounded-r-none bg-white/10 px-0 backdrop-blur-md transition-colors hover:bg-white/20"
                    onPress={() => setIsPageListOpen(!isPageListOpen)}
                    tooltip="显示分集列表"
                    tooltipProps={{
                      placement: "left",
                    }}
                  >
                    <RiArrowLeftSLine size={24} className="text-white/80" />
                  </IconButton>
                </div>
              )}

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
            </DrawerBody>
          )
        }
      </DrawerContent>
    </Drawer>
  );
};

export default FullScreenPlayer;
