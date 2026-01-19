import React from "react";

import { Avatar } from "@heroui/react";
import { RiAppsLine, RiSendInsLine } from "@remixicon/react";
import clsx from "classnames";

export interface AuthorItem {
  mid: number;
  face: string;
  name: string;
}

interface UserItemProps {
  author: AuthorItem | null;
  isSelected: boolean;
  onSelect: (mid: number | null) => void;
}

const UserItem: React.FC<UserItemProps> = ({ author, isSelected, onSelect }) => {
  const displayName = author?.name || "全部";
  const displayFace = author?.face || "";
  const isAll = author === null;
  return (
    <div
      title={displayName}
      className={`group flex w-full flex-row items-center gap-3 px-2 py-2 ${
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
        color={isSelected && !isAll ? "primary" : "default"}
        className="h-9 w-9 shrink-0 rounded-full transition-transform hover:scale-105"
        classNames={{
          img: "rounded-full",
        }}
        fallback={
          isAll ? (
            <RiAppsLine
              size={18}
              className={clsx({
                "text-primary": isSelected,
              })}
            />
          ) : (
            <RiSendInsLine size={18} />
          )
        }
      />
      <span className="group-hover:text-primary w-full truncate text-sm">{displayName}</span>
    </div>
  );
};

export default UserItem;
