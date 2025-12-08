import { RiPlayCircleFill, RiYoutubeLine } from "@remixicon/react";

import { formatter, stripHtml } from "@/common/utils";

import ImageCard from "../image-card";
import Action, { type ActionProps } from "./action";

interface Props extends ActionProps {
  isTitleIncludeHtmlTag?: boolean;
  coverHeight?: number;
  footer?: React.ReactNode;
  onPress?: () => void;
  playCount?: number;
}

const MVCard = ({
  type,
  isTitleIncludeHtmlTag,
  bvid,
  aid,
  sid,
  title,
  cover,
  coverHeight = 188,
  menus,
  collectMenuTitle,
  onChangeFavSuccess,
  footer,
  onPress,
  playCount,
}: Props) => {
  return (
    <ImageCard
      imageUrl={cover}
      imageHeight={coverHeight}
      bodyClassName="group relative"
      imageMask={
        <>
          {playCount != null && playCount > 0 && (
            <>
              <div className="absolute right-0 bottom-0 left-0 z-20 h-10 bg-linear-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 z-30 flex items-center gap-0.5 p-2 text-sm text-white">
                <RiYoutubeLine size={18} className="transform" style={{ transform: "translateY(0.05em)" }} />
                {formatter.format(playCount)}
              </div>
            </>
          )}
          <div className="absolute right-0 bottom-0 z-30 p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <RiPlayCircleFill className="text-primary" size={48} />
          </div>
        </>
      }
      title={isTitleIncludeHtmlTag ? <p dangerouslySetInnerHTML={{ __html: title }} /> : title}
      titleExtra={
        <Action
          type={type}
          title={isTitleIncludeHtmlTag ? stripHtml(title) : title}
          cover={cover}
          bvid={bvid}
          aid={String(aid)}
          sid={sid}
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
