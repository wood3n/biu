import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { RiPlayCircleFill } from "@remixicon/react";

import FallbackImage from "@/assets/images/fallback.png";

import Skeleton from "./skeleton";

export type ImageCardProps = {
  cover: string;
  coverHeight?: number;
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  showPlayIcon?: boolean;
  footer?: React.ReactNode;
  onPress?: () => void;
};

const ImageCard = ({ cover, coverHeight = 188, title, titleExtra, showPlayIcon, footer, onPress }: ImageCardProps) => {
  return (
    <Card as="div" isHoverable shadow="sm" isPressable onPress={onPress} className="w-full">
      <CardBody className="group rounded-large relative flex-grow-0 overflow-hidden bg-none p-0 shadow">
        <Image
          isZoomed
          className="object-cover hover:scale-[102%]"
          height={coverHeight}
          src={cover}
          fallbackSrc={FallbackImage}
          width="100%"
        />
        {showPlayIcon && (
          <div className="absolute right-0 bottom-0 z-30 p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <RiPlayCircleFill className="text-primary" size={48} />
          </div>
        )}
      </CardBody>
      <CardFooter className="relative flex flex-grow-1 flex-col items-start justify-between space-y-1">
        <div className="flex w-full items-stretch justify-between">
          <div className="line-clamp-2 min-w-0 flex-grow text-start text-base wrap-anywhere break-all">{title}</div>
          {titleExtra}
        </div>
        {footer}
      </CardFooter>
    </Card>
  );
};

ImageCard.Skeleton = Skeleton;

export default ImageCard;
