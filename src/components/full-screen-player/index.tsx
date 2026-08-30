import { useEffect, useMemo, useRef, useState } from "react";

import { Drawer, DrawerBody, DrawerContent, Image, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine, RiSettings3Line } from "@remixicon/react";
import { useClickAway } from "ahooks";
import clsx from "classnames";
import { readableColor } from "color2k";
import { useShallow } from "zustand/shallow";

import { Themes } from "@/common/constants/theme";
import { hexToHsl, resolveTheme, isHex } from "@/common/utils/color";
import AudioWaveform from "@/components/audio-waveform";
import Lyrics from "@/components/lyrics";
import { useFullScreenPlayerSettings } from "@/store/full-screen-player-settings";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import Empty from "../empty";
import IconButton from "../icon-button";
import WindowAction from "../window-action";
import { useGlassmorphism } from "./glassmorphism";
import PageList from "./page-list";
import PlayList from "./play-list";
import PlayerCapsule from "./player-capsule";
import FullScreenProgressBar from "./progress-bar";
import FullScreenPlayerSettingsPanel from "./settings-panel";

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
  const themeMode = useSettings(s => s.themeMode);
  const { showLyrics, showSpectrum, showCover, showBlurredBackground, backgroundColor, spectrumColor, lyricsColor } =
    useFullScreenPlayerSettings(
      useShallow(s => ({
        showLyrics: s.showLyrics,
        showSpectrum: s.showSpectrum,
        showCover: s.showCover,
        showBlurredBackground: s.showBlurredBackground,
        backgroundColor: s.backgroundColor,
        spectrumColor: s.spectrumColor,
        lyricsColor: s.lyricsColor,
      })),
    );
  const playItem = list.find(item => item.id === playId);
  const isLocal = playItem?.source === "local";

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);
  const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [isPageListOpen, setIsPageListOpen] = useState(false);
  const [isPlayListOpen, setIsPlayListOpen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pageListRef = useRef<HTMLDivElement>(null);
  const playListRef = useRef<HTMLDivElement>(null);
  const hideUiTimeoutRef = useRef<number | null>(null);

  useClickAway(() => {
    if (isPageListOpen) {
      setIsPageListOpen(false);
    }
  }, pageListRef);
  useClickAway(() => {
    if (isPlayListOpen) {
      setIsPlayListOpen(false);
    }
  }, playListRef);

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

  useEffect(() => {
    if (!isUiVisible && isSettingsOpen) {
      setIsSettingsOpen(false);
    }
  }, [isUiVisible, isSettingsOpen]);

  const handleMouseEnter = () => {
    if (hideUiTimeoutRef.current) {
      window.clearTimeout(hideUiTimeoutRef.current);
      hideUiTimeoutRef.current = null;
    }
    if (!isUiVisible) {
      setIsUiVisible(true);
    }
  };

  const scheduleHideUi = (delay: number) => {
    if (isSettingsOpen) return;
    if (hideUiTimeoutRef.current) {
      window.clearTimeout(hideUiTimeoutRef.current);
    }
    hideUiTimeoutRef.current = window.setTimeout(() => {
      setIsUiVisible(false);
    }, delay);
  };

  const handleMouseLeave = () => {
    scheduleHideUi(3000);
  };

  const coverSrc = playItem?.pageCover || playItem?.cover;
  const { effectsProfile, bgLayerA, bgLayerB, activeBgLayer, cssVars } = useGlassmorphism(
    coverSrc,
    primaryColor,
    isOpen,
  );

  const computedForegroundHex = useMemo(() => {
    if (showBlurredBackground) return undefined;
    const baseBg =
      backgroundColor && isHex(backgroundColor) ? backgroundColor : Themes[resolveTheme(themeMode)].colors!.background;
    try {
      return readableColor(baseBg as string);
    } catch {
      return undefined;
    }
  }, [backgroundColor, themeMode, showBlurredBackground]);

  const themeVars = useMemo(() => {
    const vars: React.CSSProperties = {
      ...cssVars,
      ["--heroui-primary" as any]: hexToHsl(primaryColor),
      ["--heroui-primary-foreground" as any]: hexToHsl("#ffffff"),
    };
    if (computedForegroundHex) {
      vars["--heroui-foreground" as any] = hexToHsl(computedForegroundHex);
    }
    return vars;
  }, [cssVars, primaryColor, computedForegroundHex]);

  const appTheme = useMemo(() => resolveTheme(themeMode), [themeMode]);

  if (!playItem) return null;

  const coverSize = Math.max(220, Math.min(windowWidth * 0.42, windowHeight * 0.42, 480));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      placement="bottom"
      size="full"
      radius="none"
      isDismissable={false}
      hideCloseButton
    >
      <DrawerContent
        className={clsx("bg-background text-foreground relative h-full overflow-hidden", {
          dark: showBlurredBackground || appTheme === "dark",
          light: !showBlurredBackground && appTheme === "light",
        })}
        style={{
          ...themeVars,
          cursor: isUiVisible ? "auto" : "none",
        }}
      >
        {onClose =>
          !isOpen ? (
            <Empty />
          ) : (
            <DrawerBody
              className="group/player relative flex flex-row gap-0 overflow-hidden bg-transparent p-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={() => {
                if (!isUiVisible) {
                  setIsUiVisible(true);
                }
                scheduleHideUi(3000);
              }}
            >
              {!showBlurredBackground && (
                <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundColor: backgroundColor }} />
              )}
              {showBlurredBackground && (
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
              )}
              <div
                className={`absolute top-0 right-0 left-0 z-20 flex w-full items-center justify-between gap-2 px-4 py-4 transition-opacity duration-200 ${isUiVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <div className="window-no-drag flex items-center space-x-2 rounded-full border border-white/12 bg-black/25 py-1 pr-3 pl-1 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] backdrop-blur-2xl">
                  <IconButton title="关闭弹窗" onPress={onClose} className="text-white">
                    <RiArrowDownSLine size={24} />
                  </IconButton>
                  <h2 className="max-w-[40vw] truncate text-base font-medium text-white select-none">
                    {playItem.pageTitle || playItem.title}
                  </h2>
                  <IconButton
                    title="设置"
                    tooltip="设置"
                    className="text-white"
                    onPress={() => {
                      if (hideUiTimeoutRef.current) {
                        window.clearTimeout(hideUiTimeoutRef.current);
                        hideUiTimeoutRef.current = null;
                      }
                      setIsUiVisible(true);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <RiSettings3Line size={20} />
                  </IconButton>
                </div>
                {/* 封面关闭时：播放器胶囊紧贴窗口控制按钮右侧 */}
                <div className="flex items-center gap-2">
                  {!isLocal && !showCover && <PlayerCapsule compact />}
                  <div className="window-no-drag flex items-center rounded-full border border-white/12 bg-black/25 px-1 backdrop-blur-2xl">
                    {platform === "linux" || platform === "windows" ? <WindowAction /> : null}
                  </div>
                </div>
              </div>

              <div className="flex h-full w-full items-center justify-center">
                {!isLocal && showCover && (
                  <div
                    className={clsx(
                      "flex h-full w-full items-center px-12",
                      showLyrics ? "justify-end" : "justify-center",
                    )}
                  >
                    <div className="flex flex-col items-center gap-6">
                      <Image
                        src={coverSrc}
                        radius="lg"
                        className="transition-shadow ease-out"
                        classNames={{
                          wrapper: "pointer-events-none",
                          img: "w-full h-full object-cover select-none pointer-events-none",
                        }}
                        style={{
                          width: coverSize,
                          height: coverSize,
                          boxShadow: `0 28px 90px -35px rgb(var(--glow-rgb) / 0.55), 0 10px 32px -18px rgb(0 0 0 / 0.55)`,
                          transition: `box-shadow ${effectsProfile.transitionMs}ms ease`,
                          aspectRatio: "1 / 1",
                        }}
                      />
                      {/* 封面下方：播放控件胶囊（不自动隐藏） */}
                      <PlayerCapsule />
                    </div>
                  </div>
                )}

                {!isLocal && showLyrics && (
                  <div
                    className={clsx(
                      "h-full w-full overflow-hidden px-12 py-24",
                      !showCover ? "flex items-center justify-center" : "",
                    )}
                  >
                    <Lyrics color={lyricsColor} centered={!showCover} showControls={isUiVisible} />
                  </div>
                )}
              </div>

              {showSpectrum && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-30 flex w-full justify-center"
                  style={{
                    bottom: isUiVisible ? 20 : 8,
                    transition: "bottom 300ms ease",
                  }}
                >
                  <div className="max-w-8xl mx-auto flex w-full justify-center px-6">
                    <AudioWaveform
                      width={Math.min(1400, Math.max(600, Math.round(windowWidth * 0.85)))}
                      height={30}
                      barCount={Math.max(80, Math.min(200, Math.round((windowWidth * 0.85) / 4)))}
                      barColor={spectrumColor || "currentColor"}
                    />
                  </div>
                </div>
              )}

              {/* 底部进度条：贴紧窗口最底部，带辉光 */}
              <div
                className={clsx(
                  "absolute inset-x-0 bottom-0 z-40 transition-opacity duration-300 ease-out",
                  isUiVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <FullScreenProgressBar isDisabled={!isUiVisible} />
              </div>

              {/* 右侧：分集列表按钮，箭头 < */}
              {isUiVisible && playItem.hasMultiPart && !isPageListOpen && (
                <div className="absolute top-1/2 right-0 z-20 -translate-y-1/2">
                  <IconButton
                    className="h-24 w-6 min-w-0 rounded-l-xl rounded-r-none bg-white/10 px-0 backdrop-blur-md transition-colors hover:bg-white/20"
                    onPress={() => {
                      setIsPlayListOpen(false);
                      setIsPageListOpen(true);
                    }}
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
                  width: 280,
                  height: "min(60vh, 420px)",
                }}
                onClose={() => setIsPageListOpen(false)}
              />

              {/* 左侧：播放列表按钮，箭头 > */}
              {isUiVisible && !isPlayListOpen && (
                <div className="absolute top-1/2 left-0 z-20 -translate-y-1/2">
                  <IconButton
                    className="h-24 w-6 min-w-0 rounded-l-none rounded-r-xl bg-white/10 px-0 backdrop-blur-md transition-colors hover:bg-white/20"
                    onPress={() => {
                      setIsPageListOpen(false);
                      setIsPlayListOpen(true);
                    }}
                    tooltip="显示播放列表"
                    tooltipProps={{
                      placement: "right",
                    }}
                  >
                    <RiArrowRightSLine size={24} className="text-white/80" />
                  </IconButton>
                </div>
              )}

              <PlayList
                ref={playListRef}
                className={`absolute top-1/2 left-0 z-30 -translate-y-1/2 rounded-l-none transition-all duration-300 ease-out ${
                  isPlayListOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-full opacity-0"
                }`}
                style={{
                  width: 320,
                  height: "min(60vh, 420px)",
                }}
                onClose={() => setIsPlayListOpen(false)}
              />

              <Modal
                disableAnimation
                isOpen={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                radius="lg"
                size="md"
                placement="center"
                hideCloseButton
                isDismissable
                classNames={{
                  base: "bg-black/25 backdrop-blur-2xl backdrop-saturate-150 border border-white/12 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]",
                }}
                className="text-white"
                style={{
                  ["--heroui-foreground" as any]: hexToHsl("#ffffff"),
                }}
              >
                <ModalContent>
                  <ModalHeader>
                    <h2 className="text-lg font-semibold">播放器设置</h2>
                  </ModalHeader>
                  <ModalBody>
                    <FullScreenPlayerSettingsPanel />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </DrawerBody>
          )
        }
      </DrawerContent>
    </Drawer>
  );
};

export default FullScreenPlayer;
