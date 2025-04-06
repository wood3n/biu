import React from "react";

import clx from "classnames";
import { Image } from "@heroui/react";

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
        <div className="flex-none">
          <Image
            radius="sm"
            className="object-cover"
            loading="lazy"
            width={44}
            height={44}
            src={`${coverUrl}?param=88y88`}
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
