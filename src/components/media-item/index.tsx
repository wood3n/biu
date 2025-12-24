import React from "react";

import MusicListItem from "../music-list-item";
import { type ActionProps } from "../mv-action";
import MVCard from "../mv-card";

interface MediaItemProps extends ActionProps {
  displayMode: "card" | "list" | "compact";
  isTitleIncludeHtmlTag?: boolean;
  coverHeight?: number;
  footer?: React.ReactNode;
  onPress?: () => void;
  playCount?: number;
  duration?: number;
  isActive?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({
  displayMode,
  isTitleIncludeHtmlTag,
  coverHeight,
  footer,
  onPress,
  playCount,
  duration,
  ...rest
}) => {
  if (displayMode === "list" || displayMode === "compact") {
    return (
      <MusicListItem
        {...rest}
        compact={displayMode === "compact"}
        isTitleIncludeHtmlTag={isTitleIncludeHtmlTag}
        onPress={onPress}
        playCount={playCount}
        duration={duration}
      />
    );
  }

  return (
    <MVCard
      {...rest}
      isTitleIncludeHtmlTag={isTitleIncludeHtmlTag}
      coverHeight={coverHeight}
      footer={footer}
      onPress={onPress}
      playCount={playCount}
    />
  );
};

export default MediaItem;
