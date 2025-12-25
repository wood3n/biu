import { Skeleton } from "@heroui/react";
import { twMerge } from "tailwind-merge";

interface Props {
  showOwner?: boolean;
  showPlayCount?: boolean;
  showAddDate?: boolean;
  className?: string;
}

export const MusicPlaylistItemSkeleton = ({
  showOwner = true,
  showPlayCount = true,
  showAddDate = true,
  className,
}: Props) => {
  return (
    <div className={twMerge("flex w-full items-center gap-4 px-4 py-2", className)}>
      {/* Cover & Title */}
      <div className="flex min-w-0 grow items-center gap-3">
        <Skeleton className="h-10 w-10 flex-none rounded-md" />
        <div className="flex min-w-0 flex-col gap-1">
          <Skeleton className="h-4 w-32 rounded-lg" />
          {showOwner && <Skeleton className="h-3 w-20 rounded-lg" />}
        </div>
      </div>

      {/* Play Count */}
      {showPlayCount && (
        <div className="hidden w-32 flex-none justify-end md:flex">
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      )}

      {/* Date */}
      {showAddDate && (
        <div className="hidden w-32 flex-none md:flex">
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      )}

      {/* Duration */}
      <div className="flex w-16 flex-none justify-end">
        <Skeleton className="h-4 w-10 rounded-lg" />
      </div>

      {/* Actions */}
      <div className="flex w-10 flex-none justify-end">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
};
