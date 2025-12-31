import React from "react";

import { RiCloseCircleLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

interface Props {
  title?: React.ReactNode;
  className?: string;
}

const Empty = ({ title, className }: Props) => {
  return (
    <div className={twMerge("flex flex-col items-center justify-center space-y-2 py-20 text-zinc-600", className)}>
      <RiCloseCircleLine size={32} />
      <span>{title ?? "暂无内容"}</span>
    </div>
  );
};

export default Empty;
