import React, { useEffect, useRef, useState } from "react";

import { Button } from "@heroui/react";
import { RiArrowUpSLine } from "@remixicon/react";
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";

const ScrollContainer = ({
  ref,
  options,
  children,
  resetOnChange,
  enableBackToTop = true,
  ...props
}: OverlayScrollbarsComponentProps & {
  ref?: React.RefObject<ScrollRefObject | null>;
  /** 当该值发生变化时，重置滚动条到顶部（用于切换路由 id、tab 等场景） */
  resetOnChange?: unknown;
  /** 是否监听滚动并显示返回顶部按钮 */
  enableBackToTop?: boolean;
}) => {
  const internalRef = useRef<ScrollRefObject | null>(null);
  const scrollRef = ref ?? internalRef;
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 统一的滚动重置逻辑
  useEffect(() => {
    if (!scrollRef?.current || !resetOnChange) return;
    const viewport = scrollRef.current.osInstance()?.elements().viewport as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = 0;
      setShowBackToTop(false);
    }
  }, [resetOnChange, scrollRef]);

  useEffect(() => {
    if (!scrollRef?.current || !enableBackToTop) {
      setShowBackToTop(false);
      return;
    }

    const viewport = scrollRef.current.osInstance()?.elements().viewport as HTMLElement | null;

    if (!viewport) return;

    const handleScroll = () => {
      setShowBackToTop(viewport.scrollTop > 400);
    };

    viewport.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef, enableBackToTop]);

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
        scrollbars: { autoHide: "leave", autoHideDelay: 2000, theme: "os-theme-light" },
        overflow: { x: "hidden" },
        ...options,
      }}
      {...props}
    >
      <>
        {children}
        {enableBackToTop && showBackToTop && (
          <Button
            as="div"
            isIconOnly
            type="button"
            radius="full"
            variant="flat"
            onPress={handleBackToTop}
            aria-label="返回顶部"
            className="bg-default/50 fixed right-6 bottom-[110px] z-20 shadow-xl shadow-black/30"
          >
            <RiArrowUpSLine size={20} />
          </Button>
        )}
      </>
    </OverlayScrollbarsComponent>
  );
};

export default ScrollContainer;
export type ScrollRefObject = OverlayScrollbarsComponentRef<"div">;
