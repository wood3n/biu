import { RiPlayCircleFill } from "@remixicon/react";

import ImageCard from "../image-card";
import Action, { type ActionProps } from "./action";

interface Props extends ActionProps {
  coverHeight?: number;
  footer?: React.ReactNode;
  onPress?: () => void;
}

const MVCard = ({
  bvid,
  aid,
  cid,
  title,
  cover,
  coverHeight = 188,
  menus,
  collectMenuTitle,
  onChangeFavSuccess,
  footer,
  onPress,
}: Props) => {
  return (
    <ImageCard
      imageUrl={cover}
      imageHeight={coverHeight}
      bodyClassName="group relative"
      imageMask={
        <div className="absolute right-0 bottom-0 z-30 p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <RiPlayCircleFill className="text-primary" size={48} />
        </div>
      }
      title={title}
      titleExtra={
        <Action
          title={title as string}
          cover={cover}
          bvid={bvid}
          aid={String(aid)}
          cid={cid}
          menus={menus}
          collectMenuTitle={collectMenuTitle}
          onChangeFavSuccess={onChangeFavSuccess}
        />
      }
      footer={footer}
      onPress={onPress}
    />
  );
};

export default MVCard;
