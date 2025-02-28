import React from "react";

import { useRequest } from "ahooks";
import clx from "classnames";
import { Skeleton } from "@heroui/react";

import ScrollContainer from "@/components/scroll-container";
import { getRecommendSongs } from "@/service";
import { usePlayingSong } from "@/store/playing-song";

import { columns } from "./columns";

const Daily = () => {
  const { data, loading } = useRequest(getRecommendSongs);
  const { playingSong, update: updatePlayingSong } = usePlayingSong();

  if (loading) {
    return (
      <div className="flex h-full flex-col space-y-4">
        <div className="flex items-center">
          <Skeleton className="flex h-12 w-12 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-3 rounded-lg" />
            <Skeleton className="h-3 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollContainer>
      <div className="p-4">
        <div className="sticky top-0 z-50 mb-1 grid grid-cols-[48px_minmax(120px,_6fr)_minmax(120px,_5fr)_minmax(120px,_2fr)_minmax(120px,_3fr)] gap-4 rounded-lg bg-zinc-800 py-2 text-zinc-400">
          {columns.map(column => {
            return (
              <div key={column.key} className={clx(column.className, "flex", "items-center", `justify-${column.align ?? "start"}`)}>
                {column.title}
              </div>
            );
          })}
        </div>
        {data?.data?.dailySongs?.map((rowData, rowIndex) => {
          const isSelected = rowData.id === playingSong?.id;

          return (
            <div
              key={rowData.id}
              className={clx(
                "grid cursor-pointer grid-cols-[48px_minmax(120px,_6fr)_minmax(120px,_5fr)_minmax(120px,_2fr)_minmax(120px,_3fr)] gap-4 rounded-lg py-2",
                {
                  "bg-mid-green text-green-500": isSelected,
                  "hover:bg-zinc-800": !isSelected,
                },
              )}
              onDoubleClick={() => {
                updatePlayingSong(rowData);
              }}
            >
              {columns.map(column => (
                <div key={column.key} className={clx(column.className, "flex", "items-center", `justify-${column.align ?? "start"}`)}>
                  {column.render
                    ? column.render({
                        value: rowData[column.key],
                        index: rowIndex,
                        rowData,
                        isSelected,
                      })
                    : rowData[column.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </ScrollContainer>
  );
};

export default Daily;
