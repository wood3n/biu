import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast } from "@heroui/react";
import { RiThumbUpFill, RiThumbUpLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import { postWebInterfaceArchiveLike } from "@/service/web-interface-archive-like";
import { postWebInterfaceArchiveLikeTriple } from "@/service/web-interface-archive-like-triple";
import { useMusicFavStore } from "@/store/music-fav";
import { usePlayList } from "@/store/play-list";

const MusicThumb = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const isThumb = useMusicFavStore(s => s.isThumb);
  const setIsThumb = useMusicFavStore(s => s.setIsThumb);
  const setIsFav = useMusicFavStore(s => s.setIsFav);
  const refreshIsFav = useMusicFavStore(s => s.refreshIsFav);
  const [isProgressing, setIsProgressing] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const progressDelayTimerRef = useRef<number | null>(null);
  const ignoreNextPressRef = useRef(false);
  const isPressingRef = useRef(false);

  useEffect(() => {
    refreshIsFav();
  }, [playItem, refreshIsFav]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (progressDelayTimerRef.current) {
        window.clearTimeout(progressDelayTimerRef.current);
        progressDelayTimerRef.current = null;
      }
    };
  }, []);

  const handleToggleThumb = useCallback(async () => {
    if (!playItem?.bvid) return;
    if (ignoreNextPressRef.current) {
      ignoreNextPressRef.current = false;
      return;
    }
    const nextValue = !isThumb;
    setIsThumb(nextValue);
    try {
      const res = await postWebInterfaceArchiveLike({
        bvid: playItem.bvid,
        like: nextValue ? 1 : 2,
      });
      if (res.code !== 0) {
        setIsThumb(!nextValue);
        addToast({ title: "点赞失败，请稍后重试", color: "danger" });
      }
    } catch {
      setIsThumb(!nextValue);
      addToast({ title: "点赞失败，请稍后重试", color: "danger" });
    }
  }, [isThumb, playItem?.bvid, setIsThumb]);

  const handleTriple = useCallback(async () => {
    if (!playItem?.bvid) return;
    try {
      const res = await postWebInterfaceArchiveLikeTriple({ aid: Number(playItem.aid) });
      if (res.code === 0) {
        setIsThumb(res.data.like);
        setIsFav(res.data.fav);
      } else {
        addToast({ title: "一键三连失败，请稍后重试", color: "danger" });
      }
    } catch {
      addToast({ title: "一键三连失败，请稍后重试", color: "danger" });
    }
  }, [playItem?.bvid, setIsFav, setIsThumb]);

  const stopProgress = useCallback(() => {
    isPressingRef.current = false;
    setIsProgressing(false);
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressDelayTimerRef.current) {
      window.clearTimeout(progressDelayTimerRef.current);
      progressDelayTimerRef.current = null;
    }
  }, []);

  const handleMouseDown = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    event => {
      if (event.button !== 0) return;
      if (isThumb) return;
      isPressingRef.current = true;
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
      }
      if (progressDelayTimerRef.current) {
        window.clearTimeout(progressDelayTimerRef.current);
      }
      progressDelayTimerRef.current = window.setTimeout(() => {
        if (!isPressingRef.current) return;
        setIsProgressing(true);
      }, 500);
      longPressTimerRef.current = window.setTimeout(() => {
        if (!isPressingRef.current) return;
        ignoreNextPressRef.current = true;
        setIsProgressing(false);
        handleTriple();
      }, 2000);
    },
    [handleTriple, isThumb],
  );

  const handleMouseUp = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
    stopProgress();
  }, [stopProgress]);

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
    stopProgress();
  }, [stopProgress]);

  const handleTouchStart = useCallback<React.TouchEventHandler<HTMLDivElement>>(() => {
    if (isThumb) return;
    isPressingRef.current = true;
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
    if (progressDelayTimerRef.current) {
      window.clearTimeout(progressDelayTimerRef.current);
    }
    progressDelayTimerRef.current = window.setTimeout(() => {
      if (!isPressingRef.current) return;
      setIsProgressing(true);
    }, 500);
    longPressTimerRef.current = window.setTimeout(() => {
      if (!isPressingRef.current) return;
      ignoreNextPressRef.current = true;
      setIsProgressing(false);
      handleTriple();
    }, 2000);
  }, [handleTriple, isThumb]);

  const handleTouchEnd = useCallback<React.TouchEventHandler<HTMLDivElement>>(() => {
    stopProgress();
  }, [stopProgress]);

  return (
    <div
      className={isProgressing ? "music-thumb-progress-target relative" : "relative"}
      onMouseDownCapture={handleMouseDown}
      onMouseUpCapture={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStartCapture={handleTouchStart}
      onTouchEndCapture={handleTouchEnd}
      onTouchCancelCapture={handleTouchEnd}
    >
      <IconButton aria-label="点赞" radius="full" onPress={handleToggleThumb}>
        {isThumb ? <RiThumbUpFill size={18} className="text-primary" /> : <RiThumbUpLine size={18} />}
      </IconButton>
      {isProgressing && !isThumb && <div className="music-thumb-progress" />}
      <style>{`
        @property --music-thumb-progress {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes music-thumb-progress {
          from { --music-thumb-progress: 0deg; }
          to { --music-thumb-progress: 360deg; }
        }
        .music-thumb-progress-target {
          position: relative;
        }
        .music-thumb-progress {
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          --music-thumb-progress: 0deg;
          background: conic-gradient(hsl(var(--heroui-primary)) var(--music-thumb-progress), transparent 0deg);
          mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
          animation: music-thumb-progress 2s linear forwards;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default MusicThumb;
