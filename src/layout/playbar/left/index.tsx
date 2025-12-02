import React, { useMemo, useRef, useState, useEffect } from "react";

import { Chip, Image, Link } from "@heroui/react";

import AudioWaveform from "@/components/audio-waveform";
import Ellipsis from "@/components/ellipsis";
import { usePlayQueue } from "@/store/play-queue";
import { useSettings } from "@/store/settings";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const [showWaveform, setShowWaveform] = useState(false);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const currentCid = usePlayQueue(s => s.currentCid);
  const getAudio = usePlayQueue(s => s.getAudio);
  const primaryColor = useSettings(s => s.primaryColor);
  const mvData = usePlayQueue(s => {
    return s.list.find(item => item.bvid === s.currentBvid);
  });

  const info = useMemo(() => {
    const pageData = mvData?.pages?.find(item => item.cid === currentCid);
    const hasPages = (mvData?.pages?.length ?? 0) > 1;

    return {
      hasPages,
      title: hasPages ? pageData?.title : mvData?.title,
      coverImageUrl: hasPages ? pageData?.cover : mvData?.cover,
      isLossless: pageData?.isLossless,
      ownerName: mvData?.ownerName,
      ownerId: mvData?.ownerMid,
    };
  }, [currentCid, mvData]);

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
    <div className="flex h-full w-full items-center justify-start space-x-4">
      {showWaveform ? (
        <div ref={waveformContainerRef} className="relative min-w-0 flex-1 cursor-pointer" onClick={handleCoverClick}>
          {waveformWidth > 0 && getAudio() && (
            <AudioWaveform audioElement={getAudio()!} width={waveformWidth} height={56} barColor={primaryColor} />
          )}
        </div>
      ) : (
        <>
          <div className="flex-none cursor-pointer" onClick={handleCoverClick}>
            <Image
              radius="md"
              src={info.coverImageUrl}
              width={56}
              height={56}
              classNames={{
                wrapper: "flex-none",
              }}
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col space-y-1">
            <span className="flex items-center space-x-2">
              <Ellipsis>{info.title}</Ellipsis>
              {Boolean(info.isLossless) && <Chip size="sm">无损</Chip>}
            </span>
            {Boolean(info.ownerName) && (
              <Link href={`/user/${info.ownerId}`} className="text-foreground-500 text-sm hover:underline">
                {info.ownerName}
              </Link>
            )}
          </div>
        </>
      )}
      {Boolean(info.hasPages) && <VideoPageList />}
    </div>
  );
};

export default LeftControl;
