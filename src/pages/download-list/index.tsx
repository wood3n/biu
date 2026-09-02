import { useEffect, useState } from "react";

import { Button, Chip, Tab, Tabs, Tooltip } from "@heroui/react";
import { RiDeleteBinLine, RiExternalLinkLine, RiFolderLine } from "@remixicon/react";
import { filesize } from "filesize";

import { formatMillisecond } from "@/common/utils/time";
import { openBiliVideoLink } from "@/common/utils/url";
import Empty from "@/components/empty";
import Image from "@/components/image";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import DownloadActions from "./actions";
import DownloadProgress from "./progress";

const gridCols = "grid-cols-[1fr_200px_110px_150px_120px]";

const DownloadList = () => {
  const downloadPath = useSettings(s => s.downloadPath);
  const [downloadList, setDownloadList] = useState<MediaDownloadTask[]>([]);
  const [fileType, setFileType] = useState<string>("all");

  useEffect(() => {
    const initList = async () => {
      const list = await window.electron.getMediaDownloadTaskList();
      if (list.length) {
        setDownloadList(list);
      }
    };

    initList();

    const removeListener = window.electron.syncMediaDownloadTaskList(payload => {
      if (payload?.type === "full") {
        setDownloadList(payload.data as MediaDownloadTask[]);
      } else if (payload?.type === "update") {
        setDownloadList(prev => {
          const updateTasks = payload.data;
          return prev.map(item => {
            const updateTask = updateTasks.find(t => t.id === item.id);
            return updateTask ? { ...item, ...updateTask } : item;
          });
        });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const clearDownloadList = async () => {
    await window.electron.clearMediaDownloadTaskList();
  };

  const openDownloadDir = async () => {
    await window.electron.openDirectory(downloadPath);
  };

  const getFileQuality = (item: MediaDownloadTask) => {
    if (item.outputFileType === "video") {
      return item.videoResolution
        ? `${item.videoResolution}${item.videoFrameRate ? `@${item.videoFrameRate}` : ""}`
        : "";
    }

    if (item.audioCodecs === "flac") {
      return "flac";
    }

    if (item.audioCodecs?.includes("ec-3")) {
      return "杜比音频";
    }

    if (item.audioBandwidth) {
      return `${Math.round(item.audioBandwidth / 1000)} kbps`;
    }

    return "";
  };

  const filteredList = downloadList.filter(item => fileType === "all" || item.outputFileType === fileType);

  return (
    <ScrollContainer enableBackToTop className="h-full w-full px-4">
      <div className="mb-2">
        <div className="mb-2 flex items-center justify-between">
          <h1>下载记录</h1>
          <Button variant="flat" size="sm" startContent={<RiFolderLine size={18} />} onPress={openDownloadDir}>
            {downloadPath}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Tabs
            variant="solid"
            radius="md"
            classNames={{
              tabList: "bg-default-200/80 dark:bg-default-100/10 shadow-xs",
              cursor: "rounded-medium",
            }}
            selectedKey={fileType}
            onSelectionChange={v => {
              setFileType(v as string);
            }}
          >
            <Tab key="all" title="全部" />
            <Tab key="audio" title="音频" />
            <Tab key="video" title="视频" />
          </Tabs>
          {Boolean(filteredList.length) && (
            <Tooltip content="清空记录" closeDelay={0}>
              <Button isIconOnly variant="flat" onPress={clearDownloadList}>
                <RiDeleteBinLine size={18} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="w-full">
        <div
          className={`text-default-500 border-default-100 grid h-10 w-full items-center gap-4 border-b px-2 text-sm ${gridCols}`}
        >
          <div className="text-left">文件</div>
          <div className="text-center">状态</div>
          <div className="text-center">大小</div>
          <div className="text-center">下载时间</div>
          <div className="text-center">操作</div>
        </div>

        {filteredList.length === 0 ? (
          <Empty />
        ) : (
          filteredList.map(item => {
            const quality = getFileQuality(item);

            return (
              <div
                key={item.id}
                className={`hover:bg-content1 grid w-full items-center gap-4 px-2 py-2 transition-colors ${gridCols}`}
              >
                <div className="flex min-w-0 items-center space-x-2">
                  <Image radius="md" src={item.cover} width={48} height={48} className="mr-2 flex-none object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col items-start space-y-1 overflow-hidden">
                    <div
                      className="group flex max-w-full min-w-0 cursor-pointer items-center space-x-1 hover:underline"
                      onClick={() =>
                        openBiliVideoLink({
                          type: item.sid ? "audio" : "mv",
                          bvid: item.bvid,
                          sid: item.sid,
                        })
                      }
                    >
                      <span className="min-w-0 flex-auto truncate">{item.title}</span>
                      <RiExternalLinkLine className="w-0 flex-none group-hover:w-[16px]" />
                    </div>
                    {Boolean(quality) && (
                      <Chip size="sm" radius="sm" variant="flat">
                        {quality}
                      </Chip>
                    )}
                  </div>
                </div>
                <DownloadProgress data={item} />
                <div className="text-foreground-500 text-center text-sm">
                  {item.totalBytes ? filesize(item.totalBytes) : "-"}
                </div>
                <div className="text-foreground-500 text-center text-xs">
                  {item.createdTime ? formatMillisecond(item.createdTime) : "-"}
                </div>
                <div className="flex items-center justify-center">
                  <DownloadActions data={item} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollContainer>
  );
};

export default DownloadList;
