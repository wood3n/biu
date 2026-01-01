import { useState } from "react";

import { Image as HeroImage, type ImageProps } from "@heroui/react";
import { RiFileImageLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import { formatUrlProtocal } from "@/common/utils/url";

interface Props extends ImageProps {
  params?: string;
  emptyPlaceholder?: React.ReactNode;
}

const Image = ({ params, width, height, src, className, emptyPlaceholder, ...rest }: Props) => {
  const [isError, setIsError] = useState(false);
  const formatSrc = formatUrlProtocal(src);
  const finalSrc =
    params && formatSrc && formatSrc.includes("/bfs/") && !formatSrc.includes("@")
      ? `${formatSrc}@${params}`
      : formatSrc;

  if (!src || isError) {
    return (
      <div
        className={twMerge("border-content2 flex h-full items-center justify-center rounded-md border", className)}
        style={{ width, height }}
      >
        {emptyPlaceholder || <RiFileImageLine size="40%" className="text-default-500" />}
      </div>
    );
  }

  return (
    <HeroImage
      width={width}
      height={height}
      src={finalSrc}
      onError={() => {
        setIsError(true);
      }}
      className={twMerge("object-cover", className)}
      {...rest}
    />
  );
};

export default Image;
