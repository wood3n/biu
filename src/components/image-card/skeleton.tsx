import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";

export type SkeletonProps = {
  coverHeight?: number;
};

export default function CardSkeleton({ coverHeight = 188 }: SkeletonProps) {
  return (
    <Card className="w-full" shadow="sm" isHoverable={false} isPressable={false}>
      <CardBody className="overflow-visible p-0">
        <Skeleton className="w-full rounded-xl" style={{ height: coverHeight }} />
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-2">
        <Skeleton className="h-5 w-4/5 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
