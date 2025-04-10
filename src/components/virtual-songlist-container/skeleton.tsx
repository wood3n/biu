import React from "react";

import { Skeleton as SkeletonUI } from "@heroui/react";

import If from "../if";
import ScrollContainer from "../scroll-container";

interface Props {
  hideAlbum?: boolean;
}

const Skeleton = ({ hideAlbum }: Props) => {
  return (
    <ScrollContainer className="h-full w-full">
      <div className="p-6">
        <div className="mb-4 flex space-x-6">
          <SkeletonUI className="h-60 w-60 flex-none rounded-lg" />
          <div className="flex flex-grow flex-col justify-between">
            <div className="flex flex-col items-start space-y-4">
              <SkeletonUI className="h-10 w-3/5 rounded-lg" />
              <SkeletonUI className="h-3 w-2/5 rounded-lg" />
              <div className="flex w-full max-w-[300px] items-center gap-3">
                <SkeletonUI className="flex h-12 w-12 rounded-full" />
                <SkeletonUI className="h-3 w-3/5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </ScrollContainer>
  );
};

export default Skeleton;
