import { useCallback, useEffect, useRef, useState } from "react";

import { RiCloseLine } from "@remixicon/react";
import { AnimatePresence, motion } from "framer-motion";

import IconButton from "@/components/icon-button";
import { useModalStore } from "@/store/modal";

/** 缩放范围 */
const MIN_SCALE = 1;
const MAX_SCALE = 5;
/** 滚轮单次缩放步长 */
const WHEEL_STEP = 0.2;

/**
 * 全局图片预览弹层：半透明遮罩 + 居中大图
 * 支持 Esc/点击遮罩关闭、滚轮缩放、拖拽平移
 */
const ImagePreview = () => {
  const imagePreviewData = useModalStore(s => s.imagePreviewData);
  const close = useModalStore(s => s.onCloseImagePreview);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  const isOpen = Boolean(imagePreviewData);

  // 每次打开重置变换
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Esc 关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  /** 滚轮缩放 */
  const handleWheel = useCallback((event: React.WheelEvent) => {
    const delta = event.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  /** 拖拽平移（仅放大后有意义） */
  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({ x: drag.baseX + event.clientX - drag.startX, y: drag.baseY + event.clientY - drag.startY });
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
    }
  };

  // 缩放复位时平移归零
  useEffect(() => {
    if (scale <= MIN_SCALE) {
      setOffset({ x: 0, y: 0 });
    }
  }, [scale]);

  return (
    <AnimatePresence>
      {imagePreviewData && (
        <motion.div
          key="image-preview"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          onWheel={handleWheel}
        >
          {/* 关闭按钮 */}
          <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
            <IconButton aria-label="关闭预览" onPress={close} className="text-white/90 hover:text-white">
              <RiCloseLine size={24} />
            </IconButton>
          </div>

          <motion.img
            src={imagePreviewData.url}
            alt={imagePreviewData.alt || "图片预览"}
            draggable={false}
            className="max-h-[85vh] max-w-[90vw] cursor-grab rounded-lg object-contain shadow-[0_28px_90px_-35px_rgb(0_0_0/0.8)] select-none active:cursor-grabbing"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
            onClick={e => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* 缩放提示 */}
          {scale > MIN_SCALE && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/25 px-3 py-1 text-xs text-white/70 tabular-nums backdrop-blur-2xl">
              {Math.round(scale * 100)}%
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreview;
