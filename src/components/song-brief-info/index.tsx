import React from "react";

import { Image } from "@heroui/react";

import Artists from "../artists";

interface Props {
  name: string;
  ars?: Ar[];
  coverUrl?: string;
}

const SongBriefInfo = ({ name, ars, coverUrl }: Props) => {
  return (
    <div className="flex w-full items-center space-x-2">
      {coverUrl && (
        <div className="flex-none">
          <Image
            radius="sm"
            className="object-cover"
            loading="lazy"
            width={44}
            height={44}
            src={`${coverUrl}?param=44y44`}
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
