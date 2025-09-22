import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";

export type MVCardSkeletonProps = {
  coverHeight?: number;
};

export default function MVCardSkeleton({ coverHeight = 180 }: MVCardSkeletonProps) {
  return (
    <Card className="w-full" shadow="sm" isHoverable={false} isPressable={false}>
      <CardBody className="overflow-visible p-0">
        <Skeleton className="w-full rounded-xl" style={{ height: coverHeight }} />
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-2">
        <Skeleton className="h-5 w-4/5 rounded-lg" />
        <Skeleton className="h-5 w-3/5 rounded-lg" />
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
}
