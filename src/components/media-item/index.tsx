import React from "react";

import MusicListItem from "../music-list-item";
import MVCard from "../mv-card";
import { type ActionProps } from "../mv-card/action";

interface MediaItemProps extends ActionProps {
  displayMode: "card" | "list";
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
  isActive = false,
  ...rest
}) => {
  if (displayMode === "list") {
    return (
      <MusicListItem
        {...rest}
        isTitleIncludeHtmlTag={isTitleIncludeHtmlTag}
        onPress={onPress}
        playCount={playCount}
        duration={duration}
        isActive={isActive}
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
