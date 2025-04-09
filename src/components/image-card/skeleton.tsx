import React from "react";

import { Skeleton as SkeletonUI } from "@heroui/react";

const Skeleton = () => {
  return (
    <div className="flex space-x-6">
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
  );
};

export default Skeleton;
