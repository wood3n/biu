import React, { useEffect, useRef, useState } from "react";

import { RiArrowUpSLine } from "@remixicon/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";

import { useTheme } from "@/components/theme/use-theme";

const ScrollContainer = ({
  ref,
  options,
  children,
  resetOnChange,
  enableBackToTop,
  ...props
}: OverlayScrollbarsComponentProps & {
  ref?: React.RefObject<ScrollRefObject | null>;
  /** 当该值发生变化时，重置滚动条到顶部（用于切换路由 id、tab 等场景） */
  resetOnChange?: unknown;
  /** 是否监听滚动并显示返回顶部按钮 */
  enableBackToTop?: boolean;
}) => {
  const internalRef = useRef<OverlayScrollbarsComponentRef<"div"> | null>(null);
  const scrollRef = ref ?? internalRef;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const glassCls = isDark
    ? "border-white/10 bg-[#1b1e22]/60 shadow-[0_8px_30px_-8px_rgb(0_0_0/0.45)] hover:bg-[#1b1e22]/80"
    : "border-black/6 bg-white/60 shadow-[0_8px_30px_-10px_rgb(0_0_0/0.15)] hover:bg-white/80";

  // 统一的滚动重置逻辑
  useEffect(() => {
    if (!scrollRef?.current || !resetOnChange) return;
    const viewport = scrollRef.current.osInstance()?.elements().viewport as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = 0;
      setShowBackToTop(false);
    }
  }, [resetOnChange, scrollRef]);

  const handleBackToTop = () => {
    const viewport = scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null;

    if (!viewport) return;

    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      viewport.scrollTop = 0;
    }
  };

  return (
    <OverlayScrollbarsComponent
      ref={scrollRef}
      options={{
        scrollbars: { autoHide: "leave", autoHideDelay: 800, theme: "os-theme-light" },
        overflow: { x: "hidden" },
        ...options,
      }}
      events={{
        scroll: instance => {
          if (!enableBackToTop) {
            setShowBackToTop(false);
            return;
          }
          const viewport = instance.elements().viewport as HTMLElement | null;
          setShowBackToTop((viewport?.scrollTop ?? 0) > 400);
        },
      }}
      {...props}
    >
      <>
        {children}
        <AnimatePresence>
          {enableBackToTop && showBackToTop && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={handleBackToTop}
              role="button"
              tabIndex={0}
              aria-label="返回顶部"
              className={`fixed right-10 bottom-[120px] z-20 flex size-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-200 ${glassCls}`}
            >
              <RiArrowUpSLine size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
export type ScrollRefObject = OverlayScrollbarsComponentRef<"div">;
