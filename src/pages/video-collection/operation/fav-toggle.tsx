import { Tooltip } from "@heroui/react";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";

export interface FavToggleProps {
  /** 1：已收藏，0：未收藏 */
  isFavorite?: boolean;
  onToggleFavorite?: () => Promise<void>;
}

const FavToggle = ({ isFavorite, onToggleFavorite }: FavToggleProps) => {
  return (
    <Tooltip content={isFavorite ? "取消收藏" : "收藏"}>
      <AsyncButton isIconOnly size="md" variant="flat" onPress={onToggleFavorite}>
        {isFavorite ? <RiStarFill size={18} className="text-primary" /> : <RiStarLine size={18} />}
      </AsyncButton>
    </Tooltip>
  );
};

export default FavToggle;
