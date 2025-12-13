import { useMemo } from "react";

import { Progress, Spinner } from "@heroui/react";
import { RiCheckboxCircleLine } from "@remixicon/react";
import clx from "classnames";

import Ellipsis from "@/components/ellipsis";

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

  if (data.status === "converting") {
    return (
      <span className="text-success flex items-center space-x-1">
        <Spinner size="sm" color="success" />
        转换中
      </span>
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
      <Progress
        color={data.status === "failed" ? "danger" : "primary"}
        value={progressValue}
        maxValue={100}
        showValueLabel={false}
        size="sm"
        radius="md"
        className="w-full"
      />
      <div className="flex justify-between">
        <span
          className={clx("flex items-center space-x-1 text-xs", {
            "text-danger": data.status === "failed",
          })}
        >
          <span>{StatusDesc[data.status]}</span>
          {data.status === "failed" && Boolean(data?.error) && (
            <Ellipsis className="text-danger max-w-[160px] text-xs">{data.error}</Ellipsis>
          )}
        </span>
        <span className="text-xs">{progressValue || 0}%</span>
      </div>
    </div>
  );
};

export default DownloadProgress;
