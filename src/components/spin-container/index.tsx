import React from "react";

import clx from "classnames";
import { Spinner } from "@heroui/react";

interface Props {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

const SpinContainer = ({ loading, children, className }: Props) => {
  if (!loading) {
    return children;
  }

  return (
    <div className={clx("relative h-full overflow-hidden", className)}>
      <div
        className={clx("h-full w-full", {
          "select-none": loading,
          "pointer-events-none": loading,
          "opacity-20": loading,
        })}
      >
        {children}
      </div>
      <div className="absolute top-0 flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    </div>
  );
};

export default SpinContainer;
