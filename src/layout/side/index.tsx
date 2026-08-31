import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

import { Button, useDisclosure } from "@heroui/react";
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine } from "@remixicon/react";
import clx from "classnames";

import FavoritesEditModal from "@/components/favorites-edit-modal";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import Collection from "./collection";
import DefaultMenus from "./default-menu";
import Logo from "./logo";

const COLLAPSED_WIDTH = 72;
const MIN_WIDTH = 160;
const MAX_WIDTH = 480;

const SideNav = () => {
  const sideMenuCollapsed = useSettings(state => state.sideMenuCollapsed);
  const sideMenuWidth = useSettings(state => state.sideMenuWidth);
  const updateSettings = useSettings(state => state.update);

  const {
    isOpen: isFavoritesEditModalOpen,
    onOpen: onOpenFavoritesEditModal,
    onOpenChange: onOpenChangeFavoritesEditModal,
  } = useDisclosure();
  const [editingFavoriteId, setEditingFavoriteId] = useState<number>();
  const [editingBBPId, setEditingBBPId] = useState<string>();

  const handleOpenAddFavorite = () => {
    setEditingFavoriteId(undefined);
    setEditingBBPId(undefined);
    onOpenFavoritesEditModal();
  };

  const handleOpenEditFavorite = (id: number) => {
    setEditingFavoriteId(id);
    setEditingBBPId(undefined);
    onOpenFavoritesEditModal();
  };

  const handleOpenEditBBPFavorite = (bbpId: string) => {
    setEditingFavoriteId(undefined);
    setEditingBBPId(bbpId);
    onOpenFavoritesEditModal();
  };

  const handleFavoritesEditModalChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingFavoriteId(undefined);
      setEditingBBPId(undefined);
    }

    onOpenChangeFavoritesEditModal();
  };

  const sidebarWidth = (() => {
    if (sideMenuCollapsed) return COLLAPSED_WIDTH;
    const width = sideMenuWidth ?? 200;
    if (width < MIN_WIDTH) return MIN_WIDTH;
    if (width > MAX_WIDTH) return MAX_WIDTH;
    return width;
  })();

  const [renderWidth, setRenderWidth] = useState(sidebarWidth);
  const [isDragging, setIsDragging] = useState(false);
  const isCollapsedVisual = isDragging ? renderWidth < MIN_WIDTH : sideMenuCollapsed;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(sidebarWidth);
  const prevUserSelectRef = useRef<string | null>(null);

  useEffect(() => {
    startWidthRef.current = sidebarWidth;
    if (!isDragging) {
      setRenderWidth(sidebarWidth);
    }
  }, [isDragging, sidebarWidth]);

  const onToggleCollapsed = () => {
    updateSettings({ sideMenuCollapsed: !sideMenuCollapsed });
  };

  const onStartResize = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = event.clientX;
    startWidthRef.current = sidebarWidth;
    prevUserSelectRef.current = document.body.style.userSelect;
    document.body.style.userSelect = "none";
  };

  const computeWidth = (delta: number) => {
    const rawWidth = Math.max(COLLAPSED_WIDTH, startWidthRef.current + delta);
    const cappedWidth = Math.min(rawWidth, MAX_WIDTH);
    const willCollapse = cappedWidth < MIN_WIDTH;
    const widthForView = willCollapse ? COLLAPSED_WIDTH : Math.max(MIN_WIDTH, cappedWidth);
    const widthToPersist = Math.max(MIN_WIDTH, cappedWidth);

    return { willCollapse, widthForView, widthToPersist };
  };

  useEffect(() => {
    // re-clamp render width if max width shrinks while not dragging
    if (!isDragging) {
      setRenderWidth(prev => Math.min(Math.max(prev, COLLAPSED_WIDTH), MAX_WIDTH));
    }
  }, [isDragging]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const delta = event.clientX - startXRef.current;
      const { widthForView } = computeWidth(delta);

      setRenderWidth(widthForView);
    };

    const onMouseUp = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsDragging(false);
      if (prevUserSelectRef.current !== null) {
        document.body.style.userSelect = prevUserSelectRef.current;
      }

      const delta = event.clientX - startXRef.current;
      const { willCollapse, widthForView, widthToPersist } = computeWidth(delta);

      setRenderWidth(widthForView);
      updateSettings({ sideMenuCollapsed: willCollapse, sideMenuWidth: widthToPersist });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (isDraggingRef.current && prevUserSelectRef.current !== null) {
        document.body.style.userSelect = prevUserSelectRef.current;
      }
    };
  }, [updateSettings]);

  return (
    <>
      <div
        className={clx("border-divider/30 relative flex h-full flex-none flex-col border-r-1", {
          "transition-[width] duration-200": !isDragging,
          "transition-none": isDragging,
        })}
        style={{ width: `${renderWidth}px` }}
      >
        <Logo isCollapsed={isCollapsedVisual} />
        <ScrollContainer
          className={clx("min-h-0 flex-1 pb-2", {
            "px-4": !isCollapsedVisual,
            "px-2": isCollapsedVisual,
            "overflow-hidden": isDragging,
            "side-collapsed-center": isCollapsedVisual,
          })}
        >
          <DefaultMenus isCollapsed={isCollapsedVisual} onOpenAddFavorite={handleOpenAddFavorite} />
          <div className={isCollapsedVisual ? "mt-4" : ""} />
          <Collection
            isCollapsed={isCollapsedVisual}
            onOpenAddFavorite={handleOpenAddFavorite}
            onOpenEditFavorite={handleOpenEditFavorite}
            onOpenEditBBPFavorite={handleOpenEditBBPFavorite}
          />
        </ScrollContainer>
        <Button
          size="sm"
          isIconOnly
          fullWidth
          radius="md"
          onPress={onToggleCollapsed}
          className="text-foreground h-auto w-full flex-none border-y border-black/6 bg-white/70 py-1 backdrop-blur-2xl hover:bg-white/85 dark:border-white/10 dark:bg-[#1b1e22]/60 dark:hover:bg-[#1b1e22]/80"
        >
          {isCollapsedVisual ? <RiArrowRightDoubleLine size={16} /> : <RiArrowLeftDoubleLine size={16} />}
        </Button>
        <div
          className="hover:bg-foreground/10 absolute top-0 right-0 h-full w-2 cursor-col-resize bg-transparent"
          onMouseDown={onStartResize}
        />
      </div>
      <FavoritesEditModal
        mid={editingFavoriteId}
        bbpId={editingBBPId}
        isOpen={isFavoritesEditModalOpen}
        onOpenChange={handleFavoritesEditModalChange}
      />
    </>
  );
};

export default SideNav;
