import React from "react";

import MusicListItem from "../music-list-item";
import { type ActionProps } from "../mv-action";
import MVCard from "../mv-card";

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
