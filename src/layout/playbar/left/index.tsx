import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip, Image } from "@heroui/react";
import { RiPulseLine } from "@remixicon/react";

import { openBiliVideoLink } from "@/common/utils/url";
import AudioWaveform from "@/components/audio-waveform";
import Ellipsis from "@/components/ellipsis";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const navigate = useNavigate();
  const [showWaveform, setShowWaveform] = useState(false);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const getAudio = usePlayList(s => s.getAudio);
  const primaryColor = useSettings(s => s.primaryColor);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);

  useEffect(() => {
    if (!showWaveform || !waveformContainerRef.current) return;

    const updateWidth = () => {
      if (waveformContainerRef.current) {
        setWaveformWidth(waveformContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(waveformContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [showWaveform]);

  const handleCoverClick = () => {
    setShowWaveform(!showWaveform);
  };

  return (
    <div className="flex h-full w-full items-center justify-start space-x-2">
      {showWaveform ? (
        <div ref={waveformContainerRef} className="relative min-w-0 flex-1 cursor-pointer" onClick={handleCoverClick}>
          {waveformWidth > 0 && (
            <AudioWaveform audioElement={getAudio()} width={waveformWidth} height={56} barColor={primaryColor} />
          )}
        </div>
      ) : (
        <>
          <div className="group relative flex-none cursor-pointer" onClick={handleCoverClick}>
            <Image
              removeWrapper
              radius="md"
              src={playItem?.pageCover || playItem?.cover}
              width={56}
              height={56}
              classNames={{
                wrapper: "flex-none",
              }}
              className="object-cover"
            />
            <div className="text-primary absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100">
              <RiPulseLine size={20} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-start space-y-1">
            <span className="flex items-center space-x-2">
              <Ellipsis className="cursor-pointer hover:underline" onClick={() => openBiliVideoLink(playItem!)}>
                {playItem?.pageTitle || playItem?.title}
              </Ellipsis>
              {Boolean(playItem?.isLossless) && <Chip size="sm">无损</Chip>}
              {Boolean(playItem?.isDolby) && <Chip size="sm">杜比音频</Chip>}
            </span>
            {Boolean(playItem?.ownerName) && (
              <span
                className="text-foreground-500 cursor-pointer text-sm hover:underline"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/user/${playItem?.ownerMid}`);
                }}
              >
                {playItem?.ownerName}
              </span>
            )}
          </div>
        </>
      )}
      {Boolean(playItem?.hasMultiPart) && <VideoPageList />}
    </div>
  );
};

export default LeftControl;
