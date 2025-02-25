import React from "react";

import { Image } from "@heroui/react";

import Artists from "../artists";
import Ellipsis from "../ellipsis";

interface Props {
  name: string;
  ars?: Ar[];
  coverUrl?: string;
}

const SongBriefInfo = ({ name, ars, coverUrl }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <Image className="object-cover" loading="lazy" width={48} height={48} src={coverUrl} />
      <div className="flex flex-col space-y-1">
        <Ellipsis className="text-base">{name}</Ellipsis>
        {Boolean(ars?.length) && <Artists className="text-sm text-zinc-500" ars={ars!} />}
      </div>
    </div>
  );
};

export default SongBriefInfo;
