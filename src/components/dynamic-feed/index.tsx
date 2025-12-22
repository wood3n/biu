import React, { useEffect, useRef, useState, useCallback } from "react";

import { Spinner, Button, Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { getWebDynamicFeedAll, type WebDynamicItem } from "../../service/web-dynamic";
import ScrollContainer, { type ScrollRefObject } from "../scroll-container";
import DynamicItem from "./item";

interface DynamicFeedDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DynamicFeedDrawer = ({ isOpen, onOpenChange }: DynamicFeedDrawerProps) => {
  const [items, setItems] = useState<WebDynamicItem[]>([]);
  const [offset, setOffset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for OverlayScrollbars
  const scrollRef = useRef<ScrollRefObject>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  // Fetch data function
  const fetchData = useCallback(async (currentOffset: string = "") => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const res = await getWebDynamicFeedAll({
        type: "video",
        offset: currentOffset,
        platform: "web",
      });

      if (res.code === 0) {
        setItems(prev => (currentOffset === "" ? res.data.items : [...prev, ...res.data.items]));
        setOffset(res.data.offset);
        setHasMore(res.data.has_more);
      } else {
        setError(res.message || "Failed to load dynamics");
      }
    } catch (err) {
      setError("Network error, please try again.");
      console.error(err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Initial load when opened
  useEffect(() => {
    if (isOpen && items.length === 0) {
      fetchData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Set scroll element for virtualizer once ref is ready
  useEffect(() => {
    const initScrollElement = () => {
      if (scrollRef.current) {
        const instance = scrollRef.current.osInstance();
        if (instance) {
          setScrollElement(instance.elements().viewport);
        }
      }
    };

    // Try immediately
    initScrollElement();

    // Retry after a short delay to allow Drawer animation/mounting to complete
    const timer = setTimeout(initScrollElement, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 280, // Increased estimate size for video cards
    overscan: 5,
  });

  // Infinite scroll listener
  const handleScroll = useCallback(() => {
    if (!scrollElement || isLoading || !hasMore || error) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    // Threshold: 200px
    if (scrollHeight - scrollTop - clientHeight < 200) {
      fetchData(offset);
    }
  }, [scrollElement, isLoading, hasMore, offset, error, fetchData]);

  // Attach scroll listener to OverlayScrollbars instance
  useEffect(() => {
    if (!scrollRef.current) return;

    const instance = scrollRef.current.osInstance();
    if (!instance) return;

    const viewport = instance.elements().viewport;
    viewport.addEventListener("scroll", handleScroll);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <Drawer disableAnimation isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
      <DrawerContent>
        <DrawerHeader className="border-default-100 border-b">动态</DrawerHeader>
        <DrawerBody className="flex-1 overflow-hidden p-0">
          <ScrollContainer
            ref={scrollRef}
            className="h-full w-full"
            options={{
              scrollbars: {
                autoHide: "leave",
              },
            }}
          >
            <div
              className="relative w-full px-4 py-4"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualItem => {
                const item = items[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={rowVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full px-4"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <DynamicItem
                      item={item}
                      onClose={() => {
                        onOpenChange(false);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Loading / Error States */}
            <div className="flex w-full justify-center py-4">
              {isLoading && (
                <div className="text-default-500 flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Loading...</span>
                </div>
              )}
              {!isLoading && error && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-danger">{error}</p>
                  <Button size="sm" onPress={() => fetchData(offset)}>
                    Retry
                  </Button>
                </div>
              )}
              {!isLoading && !hasMore && items.length > 0 && (
                <p className="text-default-400 text-sm">No more dynamics</p>
              )}
              {!isLoading && !hasMore && items.length === 0 && !error && (
                <p className="text-default-400 text-sm">Empty</p>
              )}
            </div>
          </ScrollContainer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default DynamicFeedDrawer;
