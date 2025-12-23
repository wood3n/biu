import { useEffect, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  Radio,
  RadioGroup,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { RiDeleteBinLine, RiExternalLinkLine, RiFolderLine, RiInformationLine } from "@remixicon/react";
import { filesize } from "filesize";

import { formatMillisecond } from "@/common/utils";
import { openBiliVideoLink } from "@/common/utils/url";
import Empty from "@/components/empty";
import Image from "@/components/image";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import DownloadActions from "./actions";
import DownloadProgress from "./progress";

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

  return (
    <ScrollContainer className="h-full w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center space-x-1">
          <span>下载记录</span>
          <Tooltip closeDelay={0} content="下载功能需要 ffmpeg，请自行下载安装">
            <RiInformationLine />
          </Tooltip>
        </h1>
        <div className="flex items-center space-x-1">
          <Tooltip content="打开目录" closeDelay={0}>
            <Button variant="flat" onPress={openDownloadDir} startContent={<RiFolderLine size={18} />}>
              {downloadPath}
            </Button>
          </Tooltip>
        </div>
      </div>
      <Card radius="md">
        <CardBody>
          <div className="w-full overflow-x-auto">
            <Table
              fullWidth
              radius="md"
              aria-label="下载列表"
              removeWrapper
              topContent={
                <div className="flex justify-between">
                  <RadioGroup
                    orientation="horizontal"
                    value={fileType}
                    onValueChange={setFileType}
                    classNames={{
                      wrapper: "gap-4",
                    }}
                  >
                    <Radio value="all">全部</Radio>
                    <Radio value="audio">音频</Radio>
                    <Radio value="video">视频</Radio>
                  </RadioGroup>
                  {Boolean(downloadList.length) && (
                    <Tooltip content="清空记录" closeDelay={0}>
                      <Button size="sm" isIconOnly onPress={clearDownloadList}>
                        <RiDeleteBinLine size={18} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              }
              classNames={{
                th: "first:rounded-s-medium last:rounded-e-medium",
              }}
            >
              <TableHeader className="rounded-medium">
                <TableColumn width={350}>文件</TableColumn>
                <TableColumn align="center">状态</TableColumn>
                <TableColumn width={120} align="center">
                  大小
                </TableColumn>
                <TableColumn width={120} align="center">
                  下载时间
                </TableColumn>
                <TableColumn width={120} align="center">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={downloadList.filter(item => fileType === "all" || item.outputFileType === fileType)}
                emptyContent={<Empty />}
              >
                {item => {
                  const quality = getFileQuality(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[280px] truncate">
                        <div className="flex items-center space-x-2">
                          <Image radius="md" src={item.cover} width={48} height={48} className="mr-2 object-cover" />
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
                      </TableCell>
                      <TableCell>
                        <DownloadProgress data={item} />
                      </TableCell>
                      <TableCell>{item.totalBytes ? filesize(item.totalBytes) : "-"}</TableCell>
                      <TableCell>{item.createdTime ? formatMillisecond(item.createdTime) : "-"}</TableCell>
                      <TableCell>
                        <DownloadActions data={item} />
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </ScrollContainer>
  );
};

export default DownloadList;
