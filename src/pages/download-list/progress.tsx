import { useMemo } from "react";

import { Progress } from "@heroui/react";
import { RiCheckboxCircleLine } from "@remixicon/react";

import { StatusDesc } from "./status-desc";

interface Props {
  data: MediaDownloadTask;
}

const DownloadProgress = ({ data }: Props) => {
  if (data.status === "waiting") {
    return <span>等待中</span>;
  }

  if (data.status === "completed") {
    return (
      <div className="text-success flex items-center space-x-1">
        <RiCheckboxCircleLine size={16} />
        下载完成
      </div>
    );
  }

  const progressValue = useMemo(() => {
    if (data.status === "downloading") {
      return data.downloadProgress;
    }

    if (data.status === "merging") {
      return data.mergeProgress;
    }

    if (data.status === "converting") {
      return data.convertProgress;
    }
  }, [data.status, data.downloadProgress, data.mergeProgress, data.convertProgress]);

  return (
    <div className="flex h-full flex-col justify-center space-y-1">
      <Progress value={progressValue} maxValue={100} showValueLabel={false} size="sm" radius="md" className="w-full" />
      <div className="flex justify-between">
        <span className="text-xs">{StatusDesc[data.status]}</span>
        <span className="text-xs">{progressValue}%</span>
      </div>
    </div>
  );
};

export default DownloadProgress;
