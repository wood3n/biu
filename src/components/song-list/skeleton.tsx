import React from "react";

import { Skeleton as SkeletonUI } from "@heroui/react";

import If from "../if";
import ScrollContainer from "../scroll-container";

interface Props {
  hideAlbum?: boolean;
}

const Skeleton = ({ hideAlbum }: Props) => {
  return (
    <ScrollContainer className="h-full w-full p-6">
      <div className="flex w-full flex-col space-y-4">
        {Array(5)
          .fill(1)
          .map((_, index) => (
            <div key={String(index)} className="flex items-center space-x-4">
              <SkeletonUI className="h-12 w-12 rounded-lg" />
              <SkeletonUI className="h-6 flex-1 rounded-lg" />
              <If condition={!hideAlbum}>
                <SkeletonUI className="h-6 flex-1 rounded-lg" />
              </If>
              <SkeletonUI className="h-6 flex-1 rounded-lg" />
            </div>
          ))}
      </div>
    </ScrollContainer>
  );
};

export default Skeleton;
