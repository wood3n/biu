import React from "react";

import { Skeleton as SkeletonUI } from "@heroui/react";

const Skeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      {Array(2)
        .fill(1)
        .map((_, index) => (
          <div key={String(index)} className="flex w-full space-x-6 py-4">
            <SkeletonUI className="h-48 w-48 flex-none rounded-lg" />
            <div className="flex w-full flex-col space-y-4">
              {Array(5)
                .fill(1)
                .map((_, index) => (
                  <div key={String(index)} className="flex items-center space-x-4">
                    <SkeletonUI className="h-6 flex-1 rounded-lg" />
                    <SkeletonUI className="h-6 flex-1 rounded-lg" />
                    <SkeletonUI className="h-6 flex-1 rounded-lg" />
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Skeleton;
