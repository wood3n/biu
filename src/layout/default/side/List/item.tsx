import React from "react";

import classNames from "classnames";
import { Button, Image } from "@heroui/react";
import { RiPlayCircleLine } from "@remixicon/react";

interface Props {
  imgUrl?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  isSelected?: boolean;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement> | undefined;
}

const Item = ({ imgUrl, title, description, isSelected, onPointerDown }: Props) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={classNames("flex cursor-pointer items-center space-x-2 rounded-lg p-2 hover:bg-zinc-700", {
        "bg-zinc-700": isSelected,
      })}
      onPointerDown={onPointerDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="flex-none">
        <Image radius="sm" src={imgUrl} width={40} height={40} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <span className="truncate text-sm">{title}</span>
        <span className="text-xs text-zinc-400">{description}</span>
      </div>
      <div className="flex items-center">
        {hovered && (
          <Button color="success" isIconOnly size="sm" variant="light">
            <RiPlayCircleLine />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Item;
