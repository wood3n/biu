import { useState } from "react";

import { Image as HeroImage, type ImageProps } from "@heroui/react";
import { RiMovieLine, RiMusic2Fill } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import { formatUrlProtocal } from "@/common/utils/url";

interface Props extends ImageProps {
  fileType?: "audio" | "video";
  resolution?: number;
}

const Image = ({ fileType = "audio", width, height, src, className, ...rest }: Props) => {
  const [isError, setIsError] = useState(false);
  const formatSrc = formatUrlProtocal(src);
  const finalSrc =
    typeof height === "number" && formatSrc && formatSrc.includes("/bfs/") && !formatSrc.includes("@")
      ? `${formatSrc}@${height * 2}h`
      : formatSrc;

  if (isError) {
    return (
      <div
        className={twMerge("rounded-medium border-content2 flex h-full items-center justify-center border", className)}
        style={{ width, height }}
      >
        {fileType === "audio" ? <RiMusic2Fill size="40%" /> : <RiMovieLine size="40%" />}
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
