import { Card, CardBody, CardFooter, Image } from "@heroui/react";

import FallbackImage from "@/assets/images/fallback.png";

export type ImageCardProps = {
  cover: string;
  coverHeight?: number;
  title: string;
  titleExtra?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
};

export default function ImageCard({ cover, coverHeight = 188, title, titleExtra, footer, onPress }: ImageCardProps) {
  return (
    <Card isHoverable shadow="sm" isPressable onPress={onPress} className="w-full">
      <CardBody className="rounded-large flex-grow-0 overflow-hidden bg-none p-0">
        <Image
          isZoomed
          alt={title}
          className="object-cover hover:scale-[102%]"
          height={coverHeight}
          shadow="sm"
          src={cover || FallbackImage}
          fallbackSrc={FallbackImage}
          width="100%"
        />
      </CardBody>
      <CardFooter className="relative flex flex-grow-1 flex-col items-start justify-between space-y-1">
        <div className="flex w-full items-start justify-between">
          <div className="line-clamp-2 min-w-0 flex-grow text-start text-base wrap-anywhere break-all">{title}</div>
          {titleExtra}
        </div>
        {footer}
      </CardFooter>
    </Card>
  );
}
