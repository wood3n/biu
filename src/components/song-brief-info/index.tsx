import React from "react";

import clx from "classnames";
import { Image } from "@heroui/react";

import EmptyImg from "@/assets/images/empty.jpg";

import Artists from "../artists";

interface Props {
  name?: string;
  ars?: Ar[];
  coverUrl?: string;
  className?: string;
}

const SongBriefInfo = ({ name, ars, coverUrl, className }: Props) => {
  return (
    <div className={clx("flex items-center space-x-2", className)}>
      {coverUrl && (
        <div className="h-12 w-12 flex-none">
          <Image
            radius="sm"
            crossOrigin="anonymous"
            loading="lazy"
            width="100%"
            height="100%"
            src={`${coverUrl}?param=96y96&timestamp=${Date.now()}`}
            fallbackSrc={EmptyImg}
            classNames={{
              wrapper: "h-full w-full",
            }}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col space-y-0.5">
        <span title={name} className="truncate text-base">
          {name}
        </span>
        {Boolean(ars?.length) && <Artists ars={ars!} />}
      </div>
    </div>
  );
};

export default SongBriefInfo;
