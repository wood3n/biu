import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import FallbackImage from "@/assets/images/fallback.png";
import { formatUrlProtocal } from "@/common/utils/url";

import Skeleton from "./skeleton";

export interface ImageCardProps {
  imageUrl?: string;
  title: React.ReactNode;
  imageHeight?: number;
  imageMask?: React.ReactNode;
  bodyClassName?: string;
  titleExtra?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
}

const ImageCard = ({
  imageUrl,
  imageHeight = 188,
  bodyClassName,
  imageMask,
  title,
  titleExtra,
  footer,
  onPress,
}: ImageCardProps) => {
  return (
    <Card as="div" isHoverable radius="md" shadow="none" isPressable onPress={onPress} className="w-full">
      <CardBody className={twMerge("rounded-medium grow-0 overflow-hidden bg-none p-0", bodyClassName)}>
        <Image
          radius="md"
          removeWrapper
          className="object-cover"
          height={imageHeight}
          src={formatUrlProtocal(imageUrl)}
          fallbackSrc={FallbackImage}
          width="100%"
        />
        {imageMask}
      </CardBody>
      <CardFooter className="flex grow flex-col items-start justify-between space-y-1">
        <div className="flex w-full items-stretch justify-between">
          <div className="line-clamp-2 min-w-0 grow text-start text-base wrap-anywhere break-all">{title}</div>
          {titleExtra}
        </div>
        {footer}
      </CardFooter>
    </Card>
  );
};

ImageCard.Skeleton = Skeleton;

export default ImageCard;
