import { useMemo } from "react";

import { RiPlayListFill } from "@remixicon/react";

import type { MenuItemProps } from "@/components/menu/menu-item";

import MenuGroup from "@/components/menu/menu-group";
import { useUserPlaylistStore } from "@/store/user-playlist";

interface Props {
  isCollapsed?: boolean;
}

const UserPlaylistMenu = ({ isCollapsed }: Props) => {
  const playlists = useUserPlaylistStore(s => s.playlists);

  const items: MenuItemProps[] = useMemo(
    () =>
      playlists.map(pl => ({
        id: pl.id,
        title: pl.name,
        href: `/playlists/${pl.id}`,
        icon: RiPlayListFill,
        className: "px-2 py-1 h-auto",
      })),
    [playlists],
  );

  if (items.length === 0) return null;

  return <MenuGroup title="歌单" collapsed={isCollapsed} items={items} />;
};

export default UserPlaylistMenu;
