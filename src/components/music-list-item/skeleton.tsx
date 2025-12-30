import { Skeleton } from "@heroui/react";
import clx from "classnames";

interface Props {
  isCompact?: boolean;
}

const MusicListSkeleton = ({ isCompact }: Props) => {
  return <Skeleton className={clx("w-full rounded-md", isCompact ? "h-9" : "h-16")} />;
};

export default MusicListSkeleton;
