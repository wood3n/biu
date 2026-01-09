import { Button, useDisclosure } from "@heroui/react";
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine } from "@remixicon/react";
import clx from "classnames";

import FavoritesEditModal from "@/components/favorites-edit-modal";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import Collection from "./collection";
import DefaultMenus from "./default-menu";
import Logo from "./logo";

const SideNav = () => {
  const sideMenuCollapsed = useSettings(state => state.sideMenuCollapsed);
  const updateSettings = useSettings(state => state.update);

  const {
    isOpen: isFavoritesEditModalOpen,
    onOpen: onOpenFavoritesEditModal,
    onOpenChange: onOpenChangeFavoritesEditModal,
  } = useDisclosure();

  const onToggleCollapsed = () => {
    updateSettings({ sideMenuCollapsed: !sideMenuCollapsed });
  };

  return (
    <>
      <div
        className={clx(
          "border-divider/30 flex h-full flex-none flex-col border-r-1 transition-[width] duration-200",
          sideMenuCollapsed ? "w-[72px]" : "w-[200px]",
        )}
      >
        <Logo isCollapsed={sideMenuCollapsed} />
        <ScrollContainer
          className={clx("min-h-0 flex-1", {
            "px-4": !sideMenuCollapsed,
          })}
        >
          <DefaultMenus isCollapsed={sideMenuCollapsed} onOpenAddFavorite={onOpenFavoritesEditModal} />
          <Collection isCollapsed={sideMenuCollapsed} onOpenAddFavorite={onOpenFavoritesEditModal} />
        </ScrollContainer>
        <Button
          size="sm"
          isIconOnly
          fullWidth
          radius="none"
          onPress={onToggleCollapsed}
          className="bg-content1 border-divider/30 h-auto w-full flex-none border-y py-1"
        >
          {sideMenuCollapsed ? <RiArrowRightDoubleLine size={16} /> : <RiArrowLeftDoubleLine size={16} />}
        </Button>
      </div>
      <FavoritesEditModal isOpen={isFavoritesEditModalOpen} onOpenChange={onOpenChangeFavoritesEditModal} />
    </>
  );
};

export default SideNav;
