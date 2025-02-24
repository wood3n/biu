import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Listbox, ListboxItem } from "@heroui/react";

import { menus } from "./menus";

const DefaultMenu = () => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>();

  useEffect(() => {
    const pathname = location.pathname?.slice(1);
    if (pathname) {
      setSelectedKey(pathname);
    }
  }, [location.pathname]);

  return (
    <OverlayScrollbarsComponent defer options={{ scrollbars: { theme: "os-theme-light" } }}>
      <Listbox selectionMode="single" aria-label="menu">
        {menus.map(item => (
          <ListboxItem
            aria-label={item.label}
            href={item.key}
            key={item.key}
            className={selectedKey === item.key ? "bg-zinc-700" : undefined}
            startContent={item.icon}
          >
            {item.label}
          </ListboxItem>
        ))}
      </Listbox>
    </OverlayScrollbarsComponent>
  );
};

export default DefaultMenu;
