import { useMemo } from "react";

import { Progress } from "@heroui/react";
import { RiCheckboxCircleLine } from "@remixicon/react";

import { StatusDesc } from "./status-desc";

interface Props {
  data: MediaDownloadTask;
}

const StageProgress = ({ data }: Props) => {
  if (data.status === "waiting") {
    return <span className="text-xs">等待下载...</span>;
  }

  if (data.status === "completed") {
    return (
      <div className="text-success flex items-center justify-center space-x-1">
        <RiCheckboxCircleLine size={16} />
        <span>下载完成</span>
      </div>
    );
  }

  const progressValue = useMemo(() => {
    if (data.status === "merging" || data.status === "mergePaused") {
      return data.mergeProgress;
    }

    if (data.status === "converting" || data.status === "convertPaused") {
      return data.convertProgress;
    }

    return data.downloadProgress;
  }, [data.downloadProgress, data.status, data.mergeProgress, data.convertProgress]);

  return (
    <div className="flex h-full flex-col justify-center space-y-1">
      <Progress
        aria-label={StatusDesc[data.status]}
        value={progressValue}
        maxValue={100}
        showValueLabel={false}
        size="sm"
        radius="md"
        className="w-full"
        classNames={{
          indicator: data.status === "failed" ? "bg-danger" : "bg-blue-500",
        }}
      />
      <div className="flex justify-between space-x-2 text-start text-xs">
        {data.status === "failed" ? (
          <p title={data.error} className="text-danger line-clamp-2 break-all">
            {data.error}
          </p>
        ) : (
          <span className="flex-1 text-nowrap">{StatusDesc[data.status]}</span>
        )}
        <span>{progressValue || 0}%</span>
      </div>
    </div>
  );
};

export default StageProgress;
