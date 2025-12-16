import { Progress, Spinner } from "@heroui/react";
import { RiCheckboxCircleLine } from "@remixicon/react";
import clx from "classnames";

import Ellipsis from "@/components/ellipsis";

import { StatusDesc } from "./status-desc";

interface Props {
  data: MediaDownloadTask;
}

const DownloadProgress = ({ data }: Props) => {
  if (data.status === "completed") {
    return (
      <div className="text-success flex items-center space-x-1">
        <RiCheckboxCircleLine size={16} />
        下载完成
      </div>
    );
  }

  if (data.status === "merging") {
    return (
      <span className="flex items-center space-x-1">
        <Spinner size="sm" color="default" variant="spinner" className="h-4 w-4" />
        <span>合并文件中</span>
      </span>
    );
  }

  if (data.status === "converting") {
    return (
      <span className="flex items-center space-x-1">
        <Spinner size="sm" color="default" variant="spinner" className="h-4 w-4" />
        <span className="text-foreground">转换文件格式</span>
      </span>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center space-y-1">
      <Progress
        color={["failed", "downloadFailed"].includes(data.status) ? "danger" : "primary"}
        value={data.downloadProgress}
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
        <span className="text-xs">{data.downloadProgress || 0}%</span>
      </div>
    </div>
  );
};

export default DownloadProgress;
