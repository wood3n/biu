import React from "react";

import { Avatar } from "@heroui/react";
import { RiAppsLine, RiSendInsLine } from "@remixicon/react";

export interface AuthorItem {
  mid: number;
  face: string;
  name: string;
}

interface UserItemProps {
  author: AuthorItem | null;
  isSelected: boolean;
  onSelect: (mid: number | null) => void;
  fallbackIcon?: React.ReactNode;
  layout?: "row" | "column";
}

const UserItem: React.FC<UserItemProps> = ({ author, isSelected, onSelect, fallbackIcon, layout = "column" }) => {
  const displayName = author?.name || "全部";
  const displayFace = author?.face || "";
  const isAll = author === null;
  const isRow = layout === "row";
  return (
    <div
      title={displayName}
      className={`group flex ${isRow ? "w-full flex-row items-center gap-3 px-2 py-2" : "w-16 flex-col items-center gap-2"} ${
        isSelected ? "text-primary" : "text-default-500"
      } cursor-pointer`}
      onClick={() => onSelect(author?.mid ?? null)}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === "Enter") {
          onSelect(author?.mid ?? null);
        }
      }}
    >
      <Avatar
        src={displayFace}
        name={displayName}
        isBordered={isSelected}
        radius="full"
        color={isSelected ? "primary" : "default"}
        className="h-9 w-9 shrink-0 rounded-full transition-transform hover:scale-105"
        classNames={{
          img: "rounded-full",
        }}
        fallback={fallbackIcon || (isAll ? <RiAppsLine size={18} /> : <RiSendInsLine size={18} />)}
      />
      <span className={`group-hover:text-primary truncate ${isRow ? "w-full text-sm" : "w-full text-center text-xs"}`}>
        {displayName}
      </span>
    </div>
  );
};

export default UserItem;
